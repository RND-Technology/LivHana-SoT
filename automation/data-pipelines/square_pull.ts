import 'dotenv/config';
import axios, { AxiosError } from 'axios';
import bigqueryPkg from '@google-cloud/bigquery';

const { BigQuery } = bigqueryPkg;

const SQUARE_ACCESS_TOKEN = process.env.SQUARE_ACCESS_TOKEN;
const SQUARE_LOCATION_ID = process.env.SQUARE_LOCATION_ID;
const BIGQUERY_DATASET = process.env.BQ_DATASET ?? 'commerce';
const BIGQUERY_TABLE = process.env.BQ_TABLE ?? 'square_transactions';
const GCP_PROJECT_ID = process.env.GCP_PROJECT_ID;

if (!SQUARE_ACCESS_TOKEN || !SQUARE_LOCATION_ID) {
  throw new Error('Missing Square credentials (SQUARE_ACCESS_TOKEN, SQUARE_LOCATION_ID)');
}

const bigquery = new BigQuery({ projectId: GCP_PROJECT_ID });
const commonHeaders = {
  Authorization: `Bearer ${SQUARE_ACCESS_TOKEN}`,
  'Content-Type': 'application/json',
  'Square-Version': '2024-09-19',
};

const fetchTransactions = async ({ beginTime, endTime }: { beginTime: string; endTime: string }) => {
  try {
    const response = await axios.post(
      'https://connect.squareup.com/v2/payments/search',
      {
        location_ids: [SQUARE_LOCATION_ID],
        query: {
          filter: {
            date_time_filter: {
              created_at: {
                start_at: beginTime,
                end_at: endTime,
              },
            },
          },
        },
      },
      { headers: commonHeaders }
    );

    return response.data?.payments ?? [];
  } catch (error) {
    const status = (error as AxiosError).response?.status;
    if (status === 404) {
      const response = await axios.get('https://connect.squareup.com/v2/payments', {
        params: {
          begin_time: beginTime,
          end_time: endTime,
          location_id: SQUARE_LOCATION_ID,
        },
        headers: commonHeaders,
      });
      return response.data?.payments ?? [];
    }
    throw error;
  }
};

const upsertTransactions = async (rows: any[]) => {
  if (rows.length === 0) {
    console.log('No Square transactions to load');
    return;
  }

  await bigquery
    .dataset(BIGQUERY_DATASET)
    .table(BIGQUERY_TABLE)
    .insert(rows);

  console.log(`Loaded ${rows.length} transactions into ${BIGQUERY_DATASET}.${BIGQUERY_TABLE}`);
};

const main = async () => {
  const endTime = new Date().toISOString();
  const beginTime = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  console.log(`Fetching Square transactions between ${beginTime} and ${endTime}`);
  const payments = await fetchTransactions({ beginTime, endTime });

  const rows = payments.map((payment: any) => ({
    id: payment.id,
    status: payment.status,
    amount: payment.amount_money?.amount ?? 0,
    currency: payment.amount_money?.currency ?? 'USD',
    created_at: payment.created_at,
    updated_at: payment.updated_at,
    customer_id: payment.customer_id,
    location_id: payment.location_id,
    metadata: JSON.stringify(payment),
  }));

  await upsertTransactions(rows);
};

main().catch((error) => {
  console.error('Square ingestion failed', error);
  process.exit(1);
});
