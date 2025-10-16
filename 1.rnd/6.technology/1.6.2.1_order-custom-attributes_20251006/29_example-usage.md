## Example Usage

```ts
const orderId = 'order_id6';

const customAttributeKey = 'custom_attribute_key2';

try {
  const { result, ...httpResponse } = await orderCustomAttributesApi.deleteOrderCustomAttribute(
  orderId,
  customAttributeKey
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

# Retrieve Order Custom Attribute

Retrieves a [custom attribute](../../doc/models/custom-attribute.md) associated with an order.

You can use the `with_definition` query parameter to also retrieve the custom attribute definition
in the same call.

To retrieve a custom attribute owned by another application, the `visibility` setting must be
`VISIBILITY_READ_ONLY` or `VISIBILITY_READ_WRITE_VALUES`. Note that seller-defined custom attributes
also known as custom fields) are always set to `VISIBILITY_READ_WRITE_VALUES`.

```ts
async retrieveOrderCustomAttribute(
  orderId: string,
  customAttributeKey: string,
  version?: number,
  withDefinition?: boolean,
  requestOptions?: RequestOptions
): Promise<ApiResponse<RetrieveOrderCustomAttributeResponse>>
```
