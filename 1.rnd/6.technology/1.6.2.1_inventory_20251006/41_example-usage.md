## Example Usage

```ts
const catalogObjectId = 'catalog_object_id6';

try {
  const { result, ...httpResponse } = await inventoryApi.retrieveInventoryChanges(catalogObjectId);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```
