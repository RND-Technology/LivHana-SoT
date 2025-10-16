## Example Usage

```ts
const body: BatchRetrieveInventoryChangesRequest = {
  catalogObjectIds: [
    'W62UWFY35CWMYGVWK6TWJDNI'
  ],
  locationIds: [
    'C6W5YS5QM06F5'
  ],
  types: [
    'PHYSICAL_COUNT'
  ],
  states: [
    'IN_STOCK'
  ],
  updatedAfter: '2016-11-01T00:00:00.000Z',
  updatedBefore: '2016-12-01T00:00:00.000Z',
};

try {
  const { result, ...httpResponse } = await inventoryApi.batchRetrieveInventoryChanges(body);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Batch Retrieve Inventory Counts

Returns current counts for the provided
[CatalogObject](../../doc/models/catalog-object.md)s at the requested
[Location](../../doc/models/location.md)s.

Results are paginated and sorted in descending order according to their
`calculated_at` timestamp (newest first).

When `updated_after` is specified, only counts that have changed since that
time (based on the server timestamp for the most recent change) are
returned. This allows clients to perform a "sync" operation, for example
in response to receiving a Webhook notification.

```ts
async batchRetrieveInventoryCounts(
  body: BatchRetrieveInventoryCountsRequest,
  requestOptions?: RequestOptions
): Promise<ApiResponse<BatchRetrieveInventoryCountsResponse>>
```
