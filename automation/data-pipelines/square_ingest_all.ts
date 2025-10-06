import 'dotenv/config';
import axios, { AxiosError } from 'axios';
import bigqueryPkg from '@google-cloud/bigquery';

const { BigQuery } = bigqueryPkg;

const SQUARE_ACCESS_TOKEN = process.env.SQUARE_ACCESS_TOKEN;
const SQUARE_LOCATION_ID = process.env.SQUARE_LOCATION_ID;
const BIGQUERY_DATASET = process.env.BQ_DATASET ?? 'commerce';
const BIGQUERY_LOCATION = process.env.BQ_LOCATION ?? 'US';
const GCP_PROJECT_ID = process.env.GCP_PROJECT_ID;
const SQUARE_PAYMENTS_BEGIN = process.env.SQUARE_PAYMENTS_BEGIN ?? '2018-01-01T00:00:00Z';
const SQUARE_PAYMENTS_END = process.env.SQUARE_PAYMENTS_END;
const SQUARE_ORDERS_BEGIN = process.env.SQUARE_ORDERS_BEGIN ?? SQUARE_PAYMENTS_BEGIN;
const SQUARE_ORDERS_END = process.env.SQUARE_ORDERS_END ?? SQUARE_PAYMENTS_END;

if (!SQUARE_ACCESS_TOKEN) {
  throw new Error('Missing Square credentials (SQUARE_ACCESS_TOKEN)');
}

if (!GCP_PROJECT_ID) {
  throw new Error('Missing GCP project id (GCP_PROJECT_ID)');
}

const bigquery = new BigQuery({ projectId: GCP_PROJECT_ID });
const commonHeaders = {
  Authorization: `Bearer ${SQUARE_ACCESS_TOKEN}`,
  'Content-Type': 'application/json',
  'Square-Version': '2024-09-19',
};

type Row = Record<string, unknown>;

type DomainConfig = {
  name: string;
  table: string;
  fetch: () => Promise<Row[]>;
  schema: Array<{ name: string; type: string; mode?: string }>;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const safeStringify = (value: unknown) =>
  JSON.stringify(value, (_, v) => (typeof v === 'bigint' ? v.toString() : v));

const chunk = <T>(items: T[], size: number): T[][] => {
  const result: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    result.push(items.slice(i, i + size));
  }
  return result;
};

const getAmount = (money: { amount?: number } | null | undefined) => Number(money?.amount ?? 0);

const toIso = (input: string | Date) => {
  const value = typeof input === 'string' ? new Date(input) : input;
  return new Date(value.getTime()).toISOString();
};

const buildMonthlyRanges = (startIso: string, endIso?: string) => {
  const ranges: Array<{ start: string; end: string }> = [];
  const startDate = new Date(startIso);
  const endDate = endIso ? new Date(endIso) : new Date();

  let cursor = new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), 1));

  while (cursor <= endDate) {
    const periodStart = cursor < startDate ? startDate : cursor;
    const nextMonth = new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth() + 1, 1));
    const periodEndMs = Math.min(nextMonth.getTime() - 1, endDate.getTime());
    const periodEnd = new Date(periodEndMs);

    ranges.push({ start: toIso(periodStart), end: toIso(periodEnd) });
    cursor = nextMonth;
  }

  return ranges;
};

const weightRegexes: Array<{ test: RegExp; grams: number }> = [
  { test: /(half\s*pound|\bhp\b|0\.5\s?lb)/i, grams: 226.796 },
  { test: /(quarter\s*pound|\bqp\b|0\.25\s?lb)/i, grams: 113.398 },
  { test: /(ounce|oz)/i, grams: 28.3495 },
  { test: /(half\s*ounce|1\/2\s*oz)/i, grams: 14.1748 },
  { test: /(quarter|1\/4|¼)/i, grams: 7 },
  { test: /(eighth|1\/8|⅛)/i, grams: 3.5 },
];

const inferWeightFromText = (text: string) => {
  if (!text) return { grams: 0, bucket: 'OTHER' } as const;

  const normalized = text.toLowerCase();

  const lbMatch = normalized.match(/([0-9]+(?:\.[0-9]+)?)\s*(lb|lbs|pound|pounds)/i);
  if (lbMatch) {
    const pounds = parseFloat(lbMatch[1]);
    const grams = pounds * 453.59237;
    return { grams, bucket: 'Z' as const };
  }

  const ozMatch = normalized.match(/([0-9]+(?:\.[0-9]+)?)\s*(oz|ounce|ounces)/i);
  if (ozMatch) {
    const ounces = parseFloat(ozMatch[1]);
    const grams = ounces * 28.3495;
    return { grams, bucket: grams >= 14 ? 'Z' : grams >= 6 ? 'Q' : grams >= 3 ? 'E' : 'G' } as const;
  }

  const gramMatch = normalized.match(/([0-9]+(?:\.[0-9]+)?)\s*(g|gram|grams)/i);
  if (gramMatch) {
    const grams = parseFloat(gramMatch[1]);
    return {
      grams,
      bucket: grams >= 28 ? 'Z' : grams >= 6 ? 'Q' : grams >= 3 ? 'E' : 'G',
    } as const;
  }

  for (const candidate of weightRegexes) {
    if (candidate.test.test(normalized)) {
      const grams = candidate.grams;
      return {
        grams,
        bucket: grams >= 28 ? 'Z' : grams >= 6 ? 'Q' : grams >= 3 ? 'E' : 'G',
      } as const;
    }
  }

  return { grams: 0, bucket: 'OTHER' } as const;
};

let cachedOrderPayload: { orders: Row[]; lineItems: Row[] } | null = null;

const fetchOrdersAndLineItems = async (): Promise<{ orders: Row[]; lineItems: Row[] }> => {
  if (cachedOrderPayload) {
    return cachedOrderPayload;
  }

  console.log('Fetching Square orders via orders/search');
  const orderRows: Row[] = [];
  const lineItemRows: Row[] = [];
  const ranges = buildMonthlyRanges(SQUARE_ORDERS_BEGIN, SQUARE_ORDERS_END);

  for (const range of ranges) {
    let cursor: string | undefined;

    do {
      const payload: Record<string, unknown> = {
        limit: 100,
        query: {
          filter: {
            date_time_filter: {
              created_at: {
                start_at: range.start,
                end_at: range.end,
              },
            },
          },
        },
      };

      if (SQUARE_LOCATION_ID) {
        payload.location_ids = [SQUARE_LOCATION_ID];
      }

      if (cursor) {
        payload.cursor = cursor;
      }

      const response = await axios.post('https://connect.squareup.com/v2/orders/search', payload, {
        headers: commonHeaders,
      });

      const orders = response.data?.orders ?? [];

      for (const order of orders) {
        orderRows.push({
          id: order.id,
          location_id: order.location_id ?? null,
          state: order.state ?? null,
          version: order.version ?? null,
          source: order.source?.name ?? null,
          total_money: getAmount(order.total_money),
          net_total_money: getAmount(order.net_amounts?.total_money),
          total_tax_money: getAmount(order.total_tax_money),
          total_discount_money: getAmount(order.total_discount_money),
          total_tip_money: getAmount(order.total_tip_money),
          total_service_charge_money: getAmount(order.total_service_charge_money),
          created_at: order.created_at ?? null,
          updated_at: order.updated_at ?? null,
          closed_at: order.closed_at ?? null,
          customer_id: order.customer_id ?? null,
          employee_id: order.employee_id ?? null,
          net_amount_due_money: getAmount(order.net_amount_due_money),
          data: safeStringify(order),
        });

        const orderCreatedAt = order.created_at ?? null;
        const orderUpdatedAt = order.updated_at ?? null;

        for (const item of order.line_items ?? []) {
          const quantity = parseFloat(item.quantity ?? '0');
          const descriptorParts = [item.name, item.variation_name, item.note].filter(Boolean).join(' ');
          const { grams, bucket } = inferWeightFromText(descriptorParts);

          lineItemRows.push({
            order_id: order.id,
            location_id: order.location_id ?? null,
            line_item_uid: item.uid ?? null,
            catalog_object_id: item.catalog_object_id ?? null,
            catalog_version: item.catalog_version ?? null,
            name: item.name ?? null,
            variation_name: item.variation_name ?? null,
            item_type: item.item_type ?? null,
            quantity,
            quantity_unit: item.quantity_unit?.measurement_unit?.unit ?? null,
            measurement_precision: item.quantity_unit?.precision ?? null,
            base_price_money_amount: getAmount(item.base_price_money),
            gross_sales_money_amount: getAmount(item.gross_sales_money),
            total_tax_money_amount: getAmount(item.total_tax_money),
            total_discount_money_amount: getAmount(item.total_discount_money),
            total_money_amount: getAmount(item.total_money),
            variation_total_price_money_amount: getAmount(item.variation_total_price_money),
            cost_money_amount: getAmount(item.cost_money),
            order_created_at,
            order_updated_at,
            note: item.note ?? null,
            applied_tax_uids: safeStringify(item.applied_taxes ?? []),
            applied_discount_uids: safeStringify(item.applied_discounts ?? []),
            modifiers: safeStringify(item.modifiers ?? []),
            parsed_weight_grams: grams,
            parsed_weight_bucket: bucket,
            is_brickweed: /brick\s*weed/i.test(descriptorParts),
            data: safeStringify(item),
          });
        }
      }

      cursor = response.data?.cursor;

      if (cursor) {
        await sleep(100);
      }
    } while (cursor);
  }

  cachedOrderPayload = { orders: orderRows, lineItems: lineItemRows };
  return cachedOrderPayload;
};

const truncateTable = async (table: string) => {
  const tableReference = `\`${GCP_PROJECT_ID}.${BIGQUERY_DATASET}.${table}\``;
  console.log(`Truncating ${tableReference}`);
  await bigquery.query({
    query: `TRUNCATE TABLE ${tableReference}`,
    location: BIGQUERY_LOCATION,
  });
};

const insertRows = async (table: string, rows: Row[]) => {
  if (rows.length === 0) {
    console.log(`No rows to load for ${table}`);
    return;
  }

  const tableRef = bigquery.dataset(BIGQUERY_DATASET).table(table);
  const batches = chunk(rows, 500);

  for (const batch of batches) {
    const formatted = batch.map((row) => ({ json: row }));
    await tableRef.insert(formatted, { raw: true, skipInvalidRows: true, ignoreUnknownValues: true });
    await sleep(50);
  }

  console.log(`Loaded ${rows.length} rows into ${BIGQUERY_DATASET}.${table}`);
};

const fetchOrders = async (): Promise<Row[]> => {
  const { orders } = await fetchOrdersAndLineItems();
  return orders;
};

const fetchOrderLineItems = async (): Promise<Row[]> => {
  const { lineItems } = await fetchOrdersAndLineItems();
  return lineItems;
};

const fetchPaymentsViaSearch = async (): Promise<Row[]> => {
  console.log('Fetching Square payments via payments/search');
  const rows: Row[] = [];
  let cursor: string | undefined;

  do {
    const payload: Record<string, unknown> = {
      limit: 100,
      query: {
        filter: {
          date_time_filter: {
            created_at: {
              start_at: SQUARE_PAYMENTS_BEGIN,
              ...(SQUARE_PAYMENTS_END ? { end_at: SQUARE_PAYMENTS_END } : {}),
            },
          },
        },
      },
    };

    if (SQUARE_LOCATION_ID) {
      payload.location_ids = [SQUARE_LOCATION_ID];
    }

    if (cursor) {
      payload.cursor = cursor;
    }

    const response = await axios.post('https://connect.squareup.com/v2/payments/search', payload, { headers: commonHeaders });
    const payments = response.data?.payments ?? [];

    for (const payment of payments) {
      rows.push({
        id: payment.id,
        status: payment.status,
        amount: Number(payment.amount_money?.amount ?? 0),
        currency: payment.amount_money?.currency ?? 'USD',
        created_at: payment.created_at,
        updated_at: payment.updated_at,
        customer_id: payment.customer_id,
        location_id: payment.location_id,
        metadata: safeStringify(payment),
      });
    }

    cursor = response.data?.cursor;

    if (cursor) {
      await sleep(100);
    }
  } while (cursor);

  return rows;
};

const fetchPaymentsViaList = async (): Promise<Row[]> => {
  console.log('Fetching Square payments via /v2/payments fallback');
  const rows: Row[] = [];
  let cursor: string | undefined;

  do {
    const params: Record<string, unknown> = {
      limit: 100,
      begin_time: SQUARE_PAYMENTS_BEGIN,
      sort_order: 'ASC',
    };

    if (SQUARE_PAYMENTS_END) {
      params.end_time = SQUARE_PAYMENTS_END;
    }

    if (SQUARE_LOCATION_ID) {
      params.location_id = SQUARE_LOCATION_ID;
    }

    if (cursor) {
      params.cursor = cursor;
    }

    const response = await axios.get('https://connect.squareup.com/v2/payments', {
      headers: commonHeaders,
      params,
    });

    const payments = response.data?.payments ?? [];

    for (const payment of payments) {
      rows.push({
        id: payment.id,
        status: payment.status,
        amount: Number(payment.amount_money?.amount ?? 0),
        currency: payment.amount_money?.currency ?? 'USD',
        created_at: payment.created_at,
        updated_at: payment.updated_at,
        customer_id: payment.customer_id,
        location_id: payment.location_id,
        metadata: safeStringify(payment),
      });
    }

    cursor = response.data?.cursor;

    if (cursor) {
      await sleep(100);
    }
  } while (cursor);

  return rows;
};

const fetchPayments = async (): Promise<Row[]> => {
  try {
    return await fetchPaymentsViaSearch();
  } catch (error) {
    const status = (error as AxiosError).response?.status;
    if (status === 404) {
      console.warn('payments/search not available; falling back to /v2/payments');
      return fetchPaymentsViaList();
    }
    throw error;
  }
};

const fetchCatalog = async (): Promise<Row[]> => {
  console.log('Fetching Square catalog items');
  const rows: Row[] = [];
  let cursor: string | undefined;

  do {
    const body: Record<string, unknown> = {};
    if (cursor) {
      body.cursor = cursor;
    }

    const response = await axios.post('https://connect.squareup.com/v2/catalog/list', body, { headers: commonHeaders });
    const objects = response.data?.objects ?? [];

    for (const object of objects) {
      rows.push({
        id: object.id,
        type: object.type,
        updated_at: object.updated_at ?? null,
        present_at_all_locations: object.present_at_all_locations ?? null,
        data: safeStringify(object),
      });
    }

    cursor = response.data?.cursor;

    if (cursor) {
      await sleep(100);
    }
  } while (cursor);

  return rows;
};

const fetchCustomers = async (): Promise<Row[]> => {
  console.log('Fetching Square customers');
  const rows: Row[] = [];
  let cursor: string | undefined;

  do {
    const body: Record<string, unknown> = {
      limit: 100,
    };

    if (cursor) {
      body.cursor = cursor;
    }

    const response = await axios.post('https://connect.squareup.com/v2/customers/search', body, { headers: commonHeaders });
    const customers = response.data?.customers ?? [];

    for (const customer of customers) {
      rows.push({
        id: customer.id,
        created_at: customer.created_at,
        updated_at: customer.updated_at,
        email_address: customer.email_address ?? null,
        phone_number: customer.phone_number ?? null,
        reference_id: customer.reference_id ?? null,
        data: safeStringify(customer),
      });
    }

    cursor = response.data?.cursor;

    if (cursor) {
      await sleep(100);
    }
  } while (cursor);

  return rows;
};

const fetchBankAccounts = async (): Promise<Row[]> => {
  console.log('Fetching Square bank accounts');
  const rows: Row[] = [];
  let cursor: string | undefined;

  do {
    const params: Record<string, unknown> = {
      limit: 100,
    };

    if (cursor) {
      params.cursor = cursor;
    }

    const response = await axios.get('https://connect.squareup.com/v2/bank-accounts', {
      headers: commonHeaders,
      params,
    });

    const accounts = response.data?.bank_accounts ?? [];

    for (const account of accounts) {
      rows.push({
        id: account.id,
        status: account.status,
        bank_name: account.bank_name ?? null,
        account_number_suffix: account.account_number_suffix ?? null,
        type: account.account_type ?? null,
        primary_bank_id: account.primary_bank_identification_number ?? null,
        created_at: account.created_at ?? null,
        data: safeStringify(account),
      });
    }

    cursor = response.data?.cursor;

    if (cursor) {
      await sleep(100);
    }
  } while (cursor);

  return rows;
};

const fetchMarketingCampaigns = async (): Promise<Row[]> => {
  console.log('Fetching Square marketing campaigns');
  const rows: Row[] = [];
  let cursor: string | undefined;

  do {
    const params: Record<string, unknown> = {
      limit: 100,
    };

    if (cursor) {
      params.cursor = cursor;
    }

    const response = await axios.get('https://connect.squareup.com/v2/marketing/campaigns', {
      headers: commonHeaders,
      params,
    });

    const campaigns = response.data?.campaigns ?? [];

    for (const campaign of campaigns) {
      rows.push({
        id: campaign.id,
        name: campaign.name ?? null,
        status: campaign.status ?? null,
        created_at: campaign.created_at ?? null,
        updated_at: campaign.updated_at ?? null,
        data: safeStringify(campaign),
      });
    }

    cursor = response.data?.cursor;

    if (cursor) {
      await sleep(100);
    }
  } while (cursor);

  return rows;
};

const fetchTeamMembers = async (): Promise<Row[]> => {
  console.log('Fetching Square team members');
  const rows: Row[] = [];
  let cursor: string | undefined;

  do {
    const params: Record<string, unknown> = {
      limit: 100,
    };

    if (cursor) {
      params.cursor = cursor;
    }

    const response = await axios.get('https://connect.squareup.com/v2/team-members', {
      headers: commonHeaders,
      params,
    });

    const members = response.data?.team_members ?? [];

    for (const member of members) {
      rows.push({
        id: member.id,
        status: member.status ?? null,
        given_name: member.given_name ?? null,
        family_name: member.family_name ?? null,
        email_address: member.email_address ?? null,
        phone_number: member.phone_number ?? null,
        is_owner: member.is_owner ?? null,
        created_at: member.created_at ?? null,
        updated_at: member.updated_at ?? null,
        data: safeStringify(member),
      });
    }

    cursor = response.data?.cursor;

    if (cursor) {
      await sleep(100);
    }
  } while (cursor);

  return rows;
};

const domains: DomainConfig[] = [
  {
    name: 'orders',
    table: 'square_orders',
    fetch: fetchOrders,
    schema: [
      { name: 'id', type: 'STRING' },
      { name: 'location_id', type: 'STRING' },
      { name: 'state', type: 'STRING' },
      { name: 'version', type: 'INTEGER' },
      { name: 'source', type: 'STRING' },
      { name: 'total_money', type: 'INTEGER' },
      { name: 'net_total_money', type: 'INTEGER' },
      { name: 'total_tax_money', type: 'INTEGER' },
      { name: 'total_discount_money', type: 'INTEGER' },
      { name: 'total_tip_money', type: 'INTEGER' },
      { name: 'total_service_charge_money', type: 'INTEGER' },
      { name: 'net_amount_due_money', type: 'INTEGER' },
      { name: 'customer_id', type: 'STRING' },
      { name: 'employee_id', type: 'STRING' },
      { name: 'created_at', type: 'TIMESTAMP' },
      { name: 'updated_at', type: 'TIMESTAMP' },
      { name: 'closed_at', type: 'TIMESTAMP' },
      { name: 'data', type: 'STRING' },
    ],
  },
  {
    name: 'order_line_items',
    table: 'square_order_line_items',
    fetch: fetchOrderLineItems,
    schema: [
      { name: 'order_id', type: 'STRING' },
      { name: 'location_id', type: 'STRING' },
      { name: 'line_item_uid', type: 'STRING' },
      { name: 'catalog_object_id', type: 'STRING' },
      { name: 'catalog_version', type: 'INTEGER' },
      { name: 'name', type: 'STRING' },
      { name: 'variation_name', type: 'STRING' },
      { name: 'item_type', type: 'STRING' },
      { name: 'quantity', type: 'FLOAT' },
      { name: 'quantity_unit', type: 'STRING' },
      { name: 'measurement_precision', type: 'INTEGER' },
      { name: 'base_price_money_amount', type: 'INTEGER' },
      { name: 'gross_sales_money_amount', type: 'INTEGER' },
      { name: 'total_tax_money_amount', type: 'INTEGER' },
      { name: 'total_discount_money_amount', type: 'INTEGER' },
      { name: 'total_money_amount', type: 'INTEGER' },
      { name: 'variation_total_price_money_amount', type: 'INTEGER' },
      { name: 'cost_money_amount', type: 'INTEGER' },
      { name: 'order_created_at', type: 'TIMESTAMP' },
      { name: 'order_updated_at', type: 'TIMESTAMP' },
      { name: 'note', type: 'STRING' },
      { name: 'applied_tax_uids', type: 'STRING' },
      { name: 'applied_discount_uids', type: 'STRING' },
      { name: 'modifiers', type: 'STRING' },
      { name: 'parsed_weight_grams', type: 'FLOAT' },
      { name: 'parsed_weight_bucket', type: 'STRING' },
      { name: 'is_brickweed', type: 'BOOL' },
      { name: 'data', type: 'STRING' },
    ],
  },
  {
    name: 'transactions',
    table: 'square_transactions',
    fetch: fetchPayments,
    schema: [
      { name: 'id', type: 'STRING' },
      { name: 'status', type: 'STRING' },
      { name: 'amount', type: 'INTEGER' },
      { name: 'currency', type: 'STRING' },
      { name: 'created_at', type: 'TIMESTAMP' },
      { name: 'updated_at', type: 'TIMESTAMP' },
      { name: 'customer_id', type: 'STRING' },
      { name: 'location_id', type: 'STRING' },
      { name: 'metadata', type: 'STRING' },
    ],
  },
  {
    name: 'catalog',
    table: 'square_items',
    fetch: fetchCatalog,
    schema: [
      { name: 'id', type: 'STRING' },
      { name: 'type', type: 'STRING' },
      { name: 'updated_at', type: 'TIMESTAMP' },
      { name: 'present_at_all_locations', type: 'BOOL' },
      { name: 'data', type: 'STRING' },
    ],
  },
  {
    name: 'customers',
    table: 'square_customers',
    fetch: fetchCustomers,
    schema: [
      { name: 'id', type: 'STRING' },
      { name: 'created_at', type: 'TIMESTAMP' },
      { name: 'updated_at', type: 'TIMESTAMP' },
      { name: 'email_address', type: 'STRING' },
      { name: 'phone_number', type: 'STRING' },
      { name: 'reference_id', type: 'STRING' },
      { name: 'data', type: 'STRING' },
    ],
  },
  {
    name: 'banking',
    table: 'square_bank_accounts',
    fetch: fetchBankAccounts,
    schema: [
      { name: 'id', type: 'STRING' },
      { name: 'status', type: 'STRING' },
      { name: 'bank_name', type: 'STRING' },
      { name: 'account_number_suffix', type: 'STRING' },
      { name: 'type', type: 'STRING' },
      { name: 'primary_bank_id', type: 'STRING' },
      { name: 'created_at', type: 'TIMESTAMP' },
      { name: 'data', type: 'STRING' },
    ],
  },
  {
    name: 'marketing',
    table: 'square_marketing_campaigns',
    fetch: fetchMarketingCampaigns,
    schema: [
      { name: 'id', type: 'STRING' },
      { name: 'name', type: 'STRING' },
      { name: 'status', type: 'STRING' },
      { name: 'created_at', type: 'TIMESTAMP' },
      { name: 'updated_at', type: 'TIMESTAMP' },
      { name: 'data', type: 'STRING' },
    ],
  },
  {
    name: 'team',
    table: 'square_team_members',
    fetch: fetchTeamMembers,
    schema: [
      { name: 'id', type: 'STRING' },
      { name: 'status', type: 'STRING' },
      { name: 'given_name', type: 'STRING' },
      { name: 'family_name', type: 'STRING' },
      { name: 'email_address', type: 'STRING' },
      { name: 'phone_number', type: 'STRING' },
      { name: 'is_owner', type: 'BOOL' },
      { name: 'created_at', type: 'TIMESTAMP' },
      { name: 'updated_at', type: 'TIMESTAMP' },
      { name: 'data', type: 'STRING' },
    ],
  },
];

const ensureTables = async () => {
  const dataset = bigquery.dataset(BIGQUERY_DATASET);
  for (const domain of domains) {
    const table = dataset.table(domain.table);
    const [exists] = await table.exists();
    if (!exists) {
      console.log(`Creating table ${BIGQUERY_DATASET}.${domain.table}`);
      await table.create({
        schema: { fields: domain.schema },
        location: BIGQUERY_LOCATION,
      });
    }
  }
};

const ingestDomains = async () => {
  await ensureTables();
  for (const domain of domains) {
    console.log(`\n=== Ingesting Square ${domain.name} ===`);
    try {
      const rows = await domain.fetch();
      await truncateTable(domain.table);
      await insertRows(domain.table, rows);
    } catch (error) {
      const status = (error as AxiosError).response?.status;
      if (status === 404) {
        console.warn(`Square endpoint for ${domain.name} returned 404. Skipping.`);
        continue;
      }

      console.error(`Failed to ingest Square ${domain.name}`, error);
      throw error;
    }
  }
};

ingestDomains()
  .then(() => {
    console.log('\nSquare multi-domain ingestion completed successfully');
  })
  .catch((error) => {
    console.error('Square multi-domain ingestion failed', error);
    process.exit(1);
  });

// Optimized: 2025-10-02

// Last optimized: 2025-10-02
