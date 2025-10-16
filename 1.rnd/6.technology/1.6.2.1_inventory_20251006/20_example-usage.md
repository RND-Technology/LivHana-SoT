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
  const { result, ...httpResponse } = await inventoryApi.batchChangeInventory(body);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Batch Retrieve Inventory Changes

Returns historical physical counts and adjustments based on the
provided filter criteria.

Results are paginated and sorted in ascending order according their
`occurred_at` timestamp (oldest first).

BatchRetrieveInventoryChanges is a catch-all query endpoint for queries
that cannot be handled by other, simpler endpoints.

```ts
async batchRetrieveInventoryChanges(
  body: BatchRetrieveInventoryChangesRequest,
  requestOptions?: RequestOptions
): Promise<ApiResponse<BatchRetrieveInventoryChangesResponse>>
```
