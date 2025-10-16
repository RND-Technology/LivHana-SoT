## Example Usage

```ts
const adjustmentId = 'adjustment_id0';

try {
  const { result, ...httpResponse } = await inventoryApi.retrieveInventoryAdjustment(adjustmentId);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Deprecated Batch Change Inventory

**This endpoint is deprecated.**

Deprecated version of [BatchChangeInventory](api-endpoint:Inventory-BatchChangeInventory) after the endpoint URL
is updated to conform to the standard convention.

```ts
async deprecatedBatchChangeInventory(
  body: BatchChangeInventoryRequest,
  requestOptions?: RequestOptions
): Promise<ApiResponse<BatchChangeInventoryResponse>>
```
