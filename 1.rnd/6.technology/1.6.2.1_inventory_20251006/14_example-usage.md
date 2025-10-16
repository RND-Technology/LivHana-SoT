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
  const { result, ...httpResponse } = await inventoryApi.deprecatedBatchRetrieveInventoryChanges(body);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Deprecated Batch Retrieve Inventory Counts

**This endpoint is deprecated.**

Deprecated version of [BatchRetrieveInventoryCounts](api-endpoint:Inventory-BatchRetrieveInventoryCounts) after the endpoint URL
is updated to conform to the standard convention.

```ts
async deprecatedBatchRetrieveInventoryCounts(
  body: BatchRetrieveInventoryCountsRequest,
  requestOptions?: RequestOptions
): Promise<ApiResponse<BatchRetrieveInventoryCountsResponse>>
```
