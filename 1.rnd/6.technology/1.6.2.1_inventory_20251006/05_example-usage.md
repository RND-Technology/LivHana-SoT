## Example Usage

```ts
const adjustmentId = 'adjustment_id0';

try {
  const { result, ...httpResponse } = await inventoryApi.deprecatedRetrieveInventoryAdjustment(adjustmentId);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Retrieve Inventory Adjustment

Returns the [InventoryAdjustment](../../doc/models/inventory-adjustment.md) object
with the provided `adjustment_id`.

```ts
async retrieveInventoryAdjustment(
  adjustmentId: string,
  requestOptions?: RequestOptions
): Promise<ApiResponse<RetrieveInventoryAdjustmentResponse>>
```
