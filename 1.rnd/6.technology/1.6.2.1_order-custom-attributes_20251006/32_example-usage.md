## Example Usage

```ts
const orderId = 'order_id6';

const customAttributeKey = 'custom_attribute_key2';

const withDefinition = false;

try {
  const { result, ...httpResponse } = await orderCustomAttributesApi.retrieveOrderCustomAttribute(
  orderId,
  customAttributeKey,
  undefined,
  withDefinition
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

# Upsert Order Custom Attribute

Creates or updates a [custom attribute](../../doc/models/custom-attribute.md) for an order.

Use this endpoint to set the value of a custom attribute for a specific order.
A custom attribute is based on a custom attribute definition in a Square seller account. (To create a
custom attribute definition, use the [CreateOrderCustomAttributeDefinition](../../doc/api/order-custom-attributes.md#create-order-custom-attribute-definition) endpoint.)

To create or update a custom attribute owned by another application, the `visibility` setting
must be `VISIBILITY_READ_WRITE_VALUES`. Note that seller-defined custom attributes
(also known as custom fields) are always set to `VISIBILITY_READ_WRITE_VALUES`.

```ts
async upsertOrderCustomAttribute(
  orderId: string,
  customAttributeKey: string,
  body: UpsertOrderCustomAttributeRequest,
  requestOptions?: RequestOptions
): Promise<ApiResponse<UpsertOrderCustomAttributeResponse>>
```
