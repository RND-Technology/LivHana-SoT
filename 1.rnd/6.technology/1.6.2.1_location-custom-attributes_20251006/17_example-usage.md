## Example Usage

```ts
const key = 'key0';

const body: UpdateLocationCustomAttributeDefinitionRequest = {
  customAttributeDefinition: {
    description: 'Update the description as desired.',
    visibility: 'VISIBILITY_READ_ONLY',
  },
};

try {
  const { result, ...httpResponse } = await locationCustomAttributesApi.updateLocationCustomAttributeDefinition(
  key,
  body
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

# Bulk Delete Location Custom Attributes

Deletes [custom attributes](../../doc/models/custom-attribute.md) for locations as a bulk operation.
To delete a custom attribute owned by another application, the `visibility` setting must be
`VISIBILITY_READ_WRITE_VALUES`.

```ts
async bulkDeleteLocationCustomAttributes(
  body: BulkDeleteLocationCustomAttributesRequest,
  requestOptions?: RequestOptions
): Promise<ApiResponse<BulkDeleteLocationCustomAttributesResponse>>
```
