## Example Usage

```ts
try {
  const { result, ...httpResponse } = await customerCustomAttributesApi.listCustomerCustomAttributeDefinitions();
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Create Customer Custom Attribute Definition

Creates a customer-related [custom attribute definition](../../doc/models/custom-attribute-definition.md) for a Square seller account.
Use this endpoint to define a custom attribute that can be associated with customer profiles.

A custom attribute definition specifies the `key`, `visibility`, `schema`, and other properties
for a custom attribute. After the definition is created, you can call
[UpsertCustomerCustomAttribute](../../doc/api/customer-custom-attributes.md#upsert-customer-custom-attribute) or
[BulkUpsertCustomerCustomAttributes](../../doc/api/customer-custom-attributes.md#bulk-upsert-customer-custom-attributes)
to set the custom attribute for customer profiles in the seller's Customer Directory.

Sellers can view all custom attributes in exported customer data, including those set to
`VISIBILITY_HIDDEN`.

```ts
async createCustomerCustomAttributeDefinition(
  body: CreateCustomerCustomAttributeDefinitionRequest,
  requestOptions?: RequestOptions
): Promise<ApiResponse<CreateCustomerCustomAttributeDefinitionResponse>>
```
