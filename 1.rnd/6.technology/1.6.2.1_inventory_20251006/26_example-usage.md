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
  const { result, ...httpResponse } = await inventoryApi.batchRetrieveInventoryCounts(body);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Deprecated Retrieve Inventory Physical Count

**This endpoint is deprecated.**

Deprecated version of [RetrieveInventoryPhysicalCount](api-endpoint:Inventory-RetrieveInventoryPhysicalCount) after the endpoint URL
is updated to conform to the standard convention.

```ts
async deprecatedRetrieveInventoryPhysicalCount(
  physicalCountId: string,
  requestOptions?: RequestOptions
): Promise<ApiResponse<RetrieveInventoryPhysicalCountResponse>>
```
