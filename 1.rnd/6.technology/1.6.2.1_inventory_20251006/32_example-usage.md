## Example Usage

```ts
const physicalCountId = 'physical_count_id2';

try {
  const { result, ...httpResponse } = await inventoryApi.retrieveInventoryPhysicalCount(physicalCountId);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Retrieve Inventory Transfer

Returns the [InventoryTransfer](../../doc/models/inventory-transfer.md) object
with the provided `transfer_id`.

```ts
async retrieveInventoryTransfer(
  transferId: string,
  requestOptions?: RequestOptions
): Promise<ApiResponse<RetrieveInventoryTransferResponse>>
```
