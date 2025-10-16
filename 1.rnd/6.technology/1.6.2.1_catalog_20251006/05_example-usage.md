## Example Usage

```ts
const body: BatchDeleteCatalogObjectsRequest = {
  objectIds: [
    'W62UWFY35CWMYGVWK6TWJDNI',
    'AA27W3M2GGTF3H6AVPNB77CK'
  ],
};

try {
  const { result, ...httpResponse } = await catalogApi.batchDeleteCatalogObjects(body);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Batch Retrieve Catalog Objects

Returns a set of objects based on the provided ID.
Each [CatalogItem](../../doc/models/catalog-item.md) returned in the set includes all of its
child information including: all of its
[CatalogItemVariation](../../doc/models/catalog-item-variation.md) objects, references to
its [CatalogModifierList](../../doc/models/catalog-modifier-list.md) objects, and the ids of
any [CatalogTax](../../doc/models/catalog-tax.md) objects that apply to it.

```ts
async batchRetrieveCatalogObjects(
  body: BatchRetrieveCatalogObjectsRequest,
  requestOptions?: RequestOptions
): Promise<ApiResponse<BatchRetrieveCatalogObjectsResponse>>
```
