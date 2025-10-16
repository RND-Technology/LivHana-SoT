## Example Usage

```ts
const imageId = 'image_id4';

const request: UpdateCatalogImageRequest = {
  idempotencyKey: '528dea59-7bfb-43c1-bd48-4a6bba7dd61f86',
};

try {
  const { result, ...httpResponse } = await catalogApi.updateCatalogImage(
  imageId,
  request
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

# Catalog Info

Retrieves information about the Square Catalog API, such as batch size
limits that can be used by the `BatchUpsertCatalogObjects` endpoint.

```ts
async catalogInfo(
  requestOptions?: RequestOptions
): Promise<ApiResponse<CatalogInfoResponse>>
```
