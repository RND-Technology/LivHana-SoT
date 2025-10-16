## Example Usage

```ts
const objectId = 'object_id8';

try {
  const { result, ...httpResponse } = await catalogApi.deleteCatalogObject(objectId);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Retrieve Catalog Object

Returns a single [CatalogItem](../../doc/models/catalog-item.md) as a
[CatalogObject](../../doc/models/catalog-object.md) based on the provided ID. The returned
object includes all of the relevant [CatalogItem](../../doc/models/catalog-item.md)
information including: [CatalogItemVariation](../../doc/models/catalog-item-variation.md)
children, references to its
[CatalogModifierList](../../doc/models/catalog-modifier-list.md) objects, and the ids of
any [CatalogTax](../../doc/models/catalog-tax.md) objects that apply to it.

```ts
async retrieveCatalogObject(
  objectId: string,
  includeRelatedObjects?: boolean,
  catalogVersion?: bigint,
  includeCategoryPathToRoot?: boolean,
  requestOptions?: RequestOptions
): Promise<ApiResponse<RetrieveCatalogObjectResponse>>
```
