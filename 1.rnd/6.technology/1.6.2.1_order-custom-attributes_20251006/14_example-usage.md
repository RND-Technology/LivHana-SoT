## Example Usage

```ts
const key = 'key0';

try {
  const { result, ...httpResponse } = await orderCustomAttributesApi.retrieveOrderCustomAttributeDefinition(key);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Update Order Custom Attribute Definition

Updates an order-related custom attribute definition for a Square seller account.

Only the definition owner can update a custom attribute definition. Note that sellers can view all custom attributes in exported customer data, including those set to `VISIBILITY_HIDDEN`.

```ts
async updateOrderCustomAttributeDefinition(
  key: string,
  body: UpdateOrderCustomAttributeDefinitionRequest,
  requestOptions?: RequestOptions
): Promise<ApiResponse<UpdateOrderCustomAttributeDefinitionResponse>>
```
