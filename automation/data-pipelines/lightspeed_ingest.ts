import 'dotenv/config';
import axios from 'axios';
import bigqueryPkg from '@google-cloud/bigquery';

const { BigQuery } = bigqueryPkg;

const LIGHTSPEED_API_KEY = process.env.KAJA_API_KEY || process.env.LIGHTSPEED_API_KEY;
const LIGHTSPEED_ACCOUNT_ID = process.env.KAJA_GATEWAY_ID || process.env.LIGHTSPEED_ACCOUNT_ID;
const BIGQUERY_DATASET = process.env.BQ_DATASET ?? 'commerce';
const BIGQUERY_TABLE = process.env.BQ_LIGHTSPEED_TABLE ?? 'lightspeed_inventory';

if (!LIGHTSPEED_API_KEY || !LIGHTSPEED_ACCOUNT_ID) {
  throw new Error('Missing Lightspeed credentials (LIGHTSPEED_API_KEY, LIGHTSPEED_ACCOUNT_ID)');
}

const bigquery = new BigQuery();
const baseUrl = `https://api.lightspeedapp.com/API/Account/${LIGHTSPEED_ACCOUNT_ID}`;

const fetchItems = async () => {
  const results: any[] = [];
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    const response = await axios.get(`${baseUrl}/Item.json`, {
      params: {
        offset,
        limit: 100,
        load_relations: 'ItemShops,ItemECommerce,Category,ItemPrices',
      },
      headers: {
        Authorization: `Bearer ${LIGHTSPEED_API_KEY}`,
        Accept: 'application/json',
      },
    });

    const items = response.data?.Item ?? [];
    results.push(...items);

    if (items.length < 100) {
      hasMore = false;
    } else {
      offset += 100;
    }
  }

  return results;
};

const upsertInventory = async (items: any[]) => {
  if (items.length === 0) {
    console.log('No Lightspeed items to load');
    return;
  }

  await bigquery
    .dataset(BIGQUERY_DATASET)
    .table(BIGQUERY_TABLE)
    .insert(items);

  console.log(`Loaded ${items.length} inventory records into ${BIGQUERY_DATASET}.${BIGQUERY_TABLE}`);
};

const main = async () => {
  console.log('Fetching Lightspeed inventory');
  const items = await fetchItems();
  const rows = items.map((item) => ({
    id: item.itemID,
    systemSku: item.systemSku,
    description: item.description,
    category: item.Category?.name,
    archived: item.archived,
    defaultCost: Number(item.defaultCost ?? 0),
    avgCost: Number(item.avgCost ?? 0),
    currentPrice: Number(item.ItemPrices?.[0]?.price ?? 0),
    quantityOnHand: Number(item.ItemShops?.[0]?.qoh ?? 0),
    quantityAvailable: Number(item.ItemShops?.[0]?.qoh ?? 0) - Number(item.ItemShops?.[0]?.reserved ?? 0),
    shopId: item.ItemShops?.[0]?.shopID,
    updatedAt: item.timeStamp,
    raw: JSON.stringify(item),
  }));

  await upsertInventory(rows);
};

main().catch((error) => {
  console.error('Lightspeed ingestion failed', error);
  process.exit(1);
});

// Optimized: 2025-10-02

// Last optimized: 2025-10-02
