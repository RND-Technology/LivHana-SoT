## Example Usage

```ts
const body: BatchRetrieveCatalogObjectsRequest = {
  objectIds: [
    'W62UWFY35CWMYGVWK6TWJDNI',
    'AA27W3M2GGTF3H6AVPNB77CK'
  ],
  includeRelatedObjects: true,
};

try {
  const { result, ...httpResponse } = await catalogApi.batchRetrieveCatalogObjects(body);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Batch Upsert Catalog Objects

Creates or updates up to 10,000 target objects based on the provided
list of objects. The target objects are grouped into batches and each batch is
inserted/updated in an all-or-nothing manner. If an object within a batch is
malformed in some way, or violates a database constraint, the entire batch
containing that item will be disregarded. However, other batches in the same
request may still succeed. Each batch may contain up to 1,000 objects, and
batches will be processed in order as long as the total object count for the
request (items, variations, modifier lists, discounts, and taxes) is no more
than 10,000.

To ensure consistency, only one update request is processed at a time per seller account.
While one (batch or non-batch) update request is being processed, other (batched and non-batched)
update requests are rejected with the `429` error code.

```ts
async batchUpsertCatalogObjects(
  body: BatchUpsertCatalogObjectsRequest,
  requestOptions?: RequestOptions
): Promise<ApiResponse<BatchUpsertCatalogObjectsResponse>>
```
