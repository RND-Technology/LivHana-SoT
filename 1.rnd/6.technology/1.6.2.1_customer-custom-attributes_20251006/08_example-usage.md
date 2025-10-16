## Example Usage

```ts
const body: CreateCustomerCustomAttributeDefinitionRequest = {
  customAttributeDefinition: {
    key: 'favoritemovie',
    name: 'Favorite Movie',
    description: 'The favorite movie of the customer.',
    visibility: 'VISIBILITY_HIDDEN',
  },
};

try {
  const { result, ...httpResponse } = await customerCustomAttributesApi.createCustomerCustomAttributeDefinition(body);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Delete Customer Custom Attribute Definition

Deletes a customer-related [custom attribute definition](../../doc/models/custom-attribute-definition.md) from a Square seller account.

Deleting a custom attribute definition also deletes the corresponding custom attribute from
all customer profiles in the seller's Customer Directory.

Only the definition owner can delete a custom attribute definition.

```ts
async deleteCustomerCustomAttributeDefinition(
  key: string,
  requestOptions?: RequestOptions
): Promise<ApiResponse<DeleteCustomerCustomAttributeDefinitionResponse>>
```
