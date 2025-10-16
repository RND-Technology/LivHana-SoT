## Example Usage

```ts
try {
  const { result, ...httpResponse } = await orderCustomAttributesApi.listOrderCustomAttributeDefinitions();
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Create Order Custom Attribute Definition

Creates an order-related custom attribute definition.  Use this endpoint to
define a custom attribute that can be associated with orders.

After creating a custom attribute definition, you can set the custom attribute for orders
in the Square seller account.

```ts
async createOrderCustomAttributeDefinition(
  body: CreateOrderCustomAttributeDefinitionRequest,
  requestOptions?: RequestOptions
): Promise<ApiResponse<CreateOrderCustomAttributeDefinitionResponse>>
```
