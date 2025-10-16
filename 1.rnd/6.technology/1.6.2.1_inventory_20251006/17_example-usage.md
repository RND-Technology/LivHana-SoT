## Example Usage

```ts
const body: BatchRetrieveInventoryCountsRequest = {
  catalogObjectIds: [
    'W62UWFY35CWMYGVWK6TWJDNI'
  ],
  locationIds: [
    '59TNP9SA8VGDA'
  ],
  updatedAfter: '2016-11-16T00:00:00.000Z',
};

try {
  const { result, ...httpResponse } = await inventoryApi.deprecatedBatchRetrieveInventoryCounts(body);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Batch Change Inventory

Applies adjustments and counts to the provided item quantities.

On success: returns the current calculated counts for all objects
referenced in the request.
On failure: returns a list of related errors.

```ts
async batchChangeInventory(
  body: BatchChangeInventoryRequest,
  requestOptions?: RequestOptions
): Promise<ApiResponse<BatchChangeInventoryResponse>>
```
