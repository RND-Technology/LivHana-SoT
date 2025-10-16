## Example Usage

```ts
const objectId = 'object_id8';

const includeRelatedObjects = false;

const includeCategoryPathToRoot = false;

try {
  const { result, ...httpResponse } = await catalogApi.retrieveCatalogObject(
  objectId,
  includeRelatedObjects,
  undefined,
  includeCategoryPathToRoot
);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Search Catalog Objects

Searches for [CatalogObject](../../doc/models/catalog-object.md) of any type by matching supported search attribute values,
excluding custom attribute values on items or item variations, against one or more of the specified query filters.

This (`SearchCatalogObjects`) endpoint differs from the [SearchCatalogItems](../../doc/api/catalog.md#search-catalog-items)
endpoint in the following aspects:

* `SearchCatalogItems` can only search for items or item variations, whereas `SearchCatalogObjects` can search for any type of catalog objects.
* `SearchCatalogItems` supports the custom attribute query filters to return items or item variations that contain custom attribute values, where `SearchCatalogObjects` does not.
* `SearchCatalogItems` does not support the `include_deleted_objects` filter to search for deleted items or item variations, whereas `SearchCatalogObjects` does.
* The both endpoints have different call conventions, including the query filter formats.

```ts
async searchCatalogObjects(
  body: SearchCatalogObjectsRequest,
  requestOptions?: RequestOptions
): Promise<ApiResponse<SearchCatalogObjectsResponse>>
```
