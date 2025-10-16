## Example Usage

```ts
const key = 'key0';

const body: UpdateMerchantCustomAttributeDefinitionRequest = {
  customAttributeDefinition: {
    description: 'Update the description as desired.',
    visibility: 'VISIBILITY_READ_ONLY',
  },
};

try {
  const { result, ...httpResponse } = await merchantCustomAttributesApi.updateMerchantCustomAttributeDefinition(
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

# Bulk Delete Merchant Custom Attributes

Deletes [custom attributes](../../doc/models/custom-attribute.md) for a merchant as a bulk operation.
To delete a custom attribute owned by another application, the `visibility` setting must be
`VISIBILITY_READ_WRITE_VALUES`.

```ts
async bulkDeleteMerchantCustomAttributes(
  body: BulkDeleteMerchantCustomAttributesRequest,
  requestOptions?: RequestOptions
): Promise<ApiResponse<BulkDeleteMerchantCustomAttributesResponse>>
```
