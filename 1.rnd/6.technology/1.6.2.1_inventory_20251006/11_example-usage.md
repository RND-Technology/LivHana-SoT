## Example Usage

```ts
const body: BatchChangeInventoryRequest = {
  idempotencyKey: '8fc6a5b0-9fe8-4b46-b46b-2ef95793abbe',
  changes: [
    {
      type: 'PHYSICAL_COUNT',
      physicalCount: {
        referenceId: '1536bfbf-efed-48bf-b17d-a197141b2a92',
        catalogObjectId: 'W62UWFY35CWMYGVWK6TWJDNI',
        state: 'IN_STOCK',
        locationId: 'C6W5YS5QM06F5',
        quantity: '53',
        teamMemberId: 'LRK57NSQ5X7PUD05',
        occurredAt: '2016-11-16T22:25:24.878Z',
      },
    }
  ],
  ignoreUnchangedCounts: true,
};

try {
  const { result, ...httpResponse } = await inventoryApi.deprecatedBatchChangeInventory(body);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Deprecated Batch Retrieve Inventory Changes

**This endpoint is deprecated.**

Deprecated version of [BatchRetrieveInventoryChanges](api-endpoint:Inventory-BatchRetrieveInventoryChanges) after the endpoint URL
is updated to conform to the standard convention.

```ts
async deprecatedBatchRetrieveInventoryChanges(
  body: BatchRetrieveInventoryChangesRequest,
  requestOptions?: RequestOptions
): Promise<ApiResponse<BatchRetrieveInventoryChangesResponse>>
```
