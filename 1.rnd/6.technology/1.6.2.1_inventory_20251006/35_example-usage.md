## Example Usage

```ts
const transferId = 'transfer_id6';

try {
  const { result, ...httpResponse } = await inventoryApi.retrieveInventoryTransfer(transferId);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Retrieve Inventory Count

Retrieves the current calculated stock count for a given
[CatalogObject](../../doc/models/catalog-object.md) at a given set of
[Location](../../doc/models/location.md)s. Responses are paginated and unsorted.
For more sophisticated queries, use a batch endpoint.

```ts
async retrieveInventoryCount(
  catalogObjectId: string,
  locationIds?: string,
  cursor?: string,
  requestOptions?: RequestOptions
): Promise<ApiResponse<RetrieveInventoryCountResponse>>
```
