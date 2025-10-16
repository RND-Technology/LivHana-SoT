## Example Usage

```ts
const key = 'key0';

const body: UpdateOrderCustomAttributeDefinitionRequest = {
  customAttributeDefinition: {
    key: 'cover-count',
    visibility: 'VISIBILITY_READ_ONLY',
    version: 1,
  },
  idempotencyKey: 'IDEMPOTENCY_KEY',
};

try {
  const { result, ...httpResponse } = await orderCustomAttributesApi.updateOrderCustomAttributeDefinition(
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

# Bulk Delete Order Custom Attributes

Deletes order [custom attributes](../../doc/models/custom-attribute.md) as a bulk operation.

Use this endpoint to delete one or more custom attributes from one or more orders.
A custom attribute is based on a custom attribute definition in a Square seller account.  (To create a
custom attribute definition, use the [CreateOrderCustomAttributeDefinition](../../doc/api/order-custom-attributes.md#create-order-custom-attribute-definition) endpoint.)

This `BulkDeleteOrderCustomAttributes` endpoint accepts a map of 1 to 25 individual delete
requests and returns a map of individual delete responses. Each delete request has a unique ID
and provides an order ID and custom attribute. Each delete response is returned with the ID
of the corresponding request.

To delete a custom attribute owned by another application, the `visibility` setting
must be `VISIBILITY_READ_WRITE_VALUES`. Note that seller-defined custom attributes
(also known as custom fields) are always set to `VISIBILITY_READ_WRITE_VALUES`.

```ts
async bulkDeleteOrderCustomAttributes(
  body: BulkDeleteOrderCustomAttributesRequest,
  requestOptions?: RequestOptions
): Promise<ApiResponse<BulkDeleteOrderCustomAttributesResponse>>
```
