## Example Usage

```ts
const body: SearchCatalogObjectsRequest = {
  objectTypes: [
    'ITEM'
  ],
  query: {
    prefixQuery: {
      attributeName: 'name',
      attributePrefix: 'tea',
    },
  },
  limit: 100,
};

try {
  const { result, ...httpResponse } = await catalogApi.searchCatalogObjects(body);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Search Catalog Items

Searches for catalog items or item variations by matching supported search attribute values, including
custom attribute values, against one or more of the specified query filters.

This (`SearchCatalogItems`) endpoint differs from the [SearchCatalogObjects](../../doc/api/catalog.md#search-catalog-objects)
endpoint in the following aspects:

* `SearchCatalogItems` can only search for items or item variations, whereas `SearchCatalogObjects` can search for any type of catalog objects.
* `SearchCatalogItems` supports the custom attribute query filters to return items or item variations that contain custom attribute values, where `SearchCatalogObjects` does not.
* `SearchCatalogItems` does not support the `include_deleted_objects` filter to search for deleted items or item variations, whereas `SearchCatalogObjects` does.
* The both endpoints use different call conventions, including the query filter formats.

```ts
async searchCatalogItems(
  body: SearchCatalogItemsRequest,
  requestOptions?: RequestOptions
): Promise<ApiResponse<SearchCatalogItemsResponse>>
```
