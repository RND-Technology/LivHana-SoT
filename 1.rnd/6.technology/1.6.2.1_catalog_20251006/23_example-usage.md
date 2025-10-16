## Example Usage

```ts
try {
  const { result, ...httpResponse } = await catalogApi.listCatalog();
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Upsert Catalog Object

Creates a new or updates the specified [CatalogObject](../../doc/models/catalog-object.md).

To ensure consistency, only one update request is processed at a time per seller account.
While one (batch or non-batch) update request is being processed, other (batched and non-batched)
update requests are rejected with the `429` error code.

```ts
async upsertCatalogObject(
  body: UpsertCatalogObjectRequest,
  requestOptions?: RequestOptions
): Promise<ApiResponse<UpsertCatalogObjectResponse>>
```
