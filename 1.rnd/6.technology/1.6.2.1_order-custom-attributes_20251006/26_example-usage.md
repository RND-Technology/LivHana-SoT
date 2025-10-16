## Example Usage

```ts
const orderId = 'order_id6';

const withDefinitions = false;

try {
  const { result, ...httpResponse } = await orderCustomAttributesApi.listOrderCustomAttributes(
  orderId,
  undefined,
  undefined,
  undefined,
  withDefinitions
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

# Delete Order Custom Attribute

Deletes a [custom attribute](../../doc/models/custom-attribute.md) associated with a customer profile.

To delete a custom attribute owned by another application, the `visibility` setting must be
`VISIBILITY_READ_WRITE_VALUES`. Note that seller-defined custom attributes
(also known as custom fields) are always set to `VISIBILITY_READ_WRITE_VALUES`.

```ts
async deleteOrderCustomAttribute(
  orderId: string,
  customAttributeKey: string,
  requestOptions?: RequestOptions
): Promise<ApiResponse<DeleteOrderCustomAttributeResponse>>
```
