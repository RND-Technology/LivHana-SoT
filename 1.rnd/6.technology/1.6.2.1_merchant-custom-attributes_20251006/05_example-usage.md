## Example Usage

```ts
try {
  const { result, ...httpResponse } = await merchantCustomAttributesApi.listMerchantCustomAttributeDefinitions();
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Create Merchant Custom Attribute Definition

Creates a merchant-related [custom attribute definition](../../doc/models/custom-attribute-definition.md) for a Square seller account.
Use this endpoint to define a custom attribute that can be associated with a merchant connecting to your application.
A custom attribute definition specifies the `key`, `visibility`, `schema`, and other properties
for a custom attribute. After the definition is created, you can call
[UpsertMerchantCustomAttribute](../../doc/api/merchant-custom-attributes.md#upsert-merchant-custom-attribute) or
[BulkUpsertMerchantCustomAttributes](../../doc/api/merchant-custom-attributes.md#bulk-upsert-merchant-custom-attributes)
to set the custom attribute for a merchant.

```ts
async createMerchantCustomAttributeDefinition(
  body: CreateMerchantCustomAttributeDefinitionRequest,
  requestOptions?: RequestOptions
): Promise<ApiResponse<CreateMerchantCustomAttributeDefinitionResponse>>
```
