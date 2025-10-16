## Example Usage

```ts
try {
  const { result, ...httpResponse } = await catalogApi.catalogInfo();
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# List Catalog

Returns a list of all [CatalogObject](../../doc/models/catalog-object.md)s of the specified types in the catalog.

The `types` parameter is specified as a comma-separated list of the [CatalogObjectType](../../doc/models/catalog-object-type.md) values,
for example, "`ITEM`, `ITEM_VARIATION`, `MODIFIER`, `MODIFIER_LIST`, `CATEGORY`, `DISCOUNT`, `TAX`, `IMAGE`".

__Important:__ ListCatalog does not return deleted catalog items. To retrieve
deleted catalog items, use [SearchCatalogObjects](../../doc/api/catalog.md#search-catalog-objects)
and set the `include_deleted_objects` attribute value to `true`.

```ts
async listCatalog(
  cursor?: string,
  types?: string,
  catalogVersion?: bigint,
  requestOptions?: RequestOptions
): Promise<ApiResponse<ListCatalogResponse>>
```
