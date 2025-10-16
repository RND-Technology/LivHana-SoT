## Example Usage

```ts
const body: CreateOrderCustomAttributeDefinitionRequest = {
  customAttributeDefinition: {
    key: 'cover-count',
    name: 'Cover count',
    description: 'The number of people seated at a table',
    visibility: 'VISIBILITY_READ_WRITE_VALUES',
  },
  idempotencyKey: 'IDEMPOTENCY_KEY',
};

try {
  const { result, ...httpResponse } = await orderCustomAttributesApi.createOrderCustomAttributeDefinition(body);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Delete Order Custom Attribute Definition

Deletes an order-related [custom attribute definition](../../doc/models/custom-attribute-definition.md) from a Square seller account.

Only the definition owner can delete a custom attribute definition.

```ts
async deleteOrderCustomAttributeDefinition(
  key: string,
  requestOptions?: RequestOptions
): Promise<ApiResponse<DeleteOrderCustomAttributeDefinitionResponse>>
```
