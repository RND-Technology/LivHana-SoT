## Example Usage

```ts
const physicalCountId = 'physical_count_id2';

try {
  const { result, ...httpResponse } = await inventoryApi.deprecatedRetrieveInventoryPhysicalCount(physicalCountId);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Retrieve Inventory Physical Count

Returns the [InventoryPhysicalCount](../../doc/models/inventory-physical-count.md)
object with the provided `physical_count_id`.

```ts
async retrieveInventoryPhysicalCount(
  physicalCountId: string,
  requestOptions?: RequestOptions
): Promise<ApiResponse<RetrieveInventoryPhysicalCountResponse>>
```
