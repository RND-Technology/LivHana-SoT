## Example Usage

```ts
const request: CreateCatalogImageRequest = {
  idempotencyKey: '528dea59-7bfb-43c1-bd48-4a6bba7dd61f86',
  image: {
    type: 'IMAGE',
    id: '#TEMP_ID',
    imageData: {
      caption: 'A picture of a cup of coffee',
    },
  },
  objectId: 'ND6EA5AAJEO5WL3JNNIAQA32',
};

try {
  const { result, ...httpResponse } = await catalogApi.createCatalogImage(request);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Update Catalog Image

Uploads a new image file to replace the existing one in the specified [CatalogImage](../../doc/models/catalog-image.md) object.

This `UpdateCatalogImage` endpoint accepts HTTP multipart/form-data requests with a JSON part and an image file part in
JPEG, PJPEG, PNG, or GIF format. The maximum file size is 15MB.

```ts
async updateCatalogImage(
  imageId: string,
  request?: UpdateCatalogImageRequest,
  imageFile?: FileWrapper,
  requestOptions?: RequestOptions
): Promise<ApiResponse<UpdateCatalogImageResponse>>
```
