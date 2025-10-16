## Example Usage

```ts
const body: BulkDeleteOrderCustomAttributesRequest = {
  values: {
    'cover-count': {
      orderId: '7BbXGEIWNldxAzrtGf9GPVZTwZ4F',
    },
    'table-number': {
      orderId: '7BbXGEIWNldxAzrtGf9GPVZTwZ4F',
    }
  },
};

try {
  const { result, ...httpResponse } = await orderCustomAttributesApi.bulkDeleteOrderCustomAttributes(body);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Bulk Upsert Order Custom Attributes

Creates or updates order [custom attributes](../../doc/models/custom-attribute.md) as a bulk operation.

Use this endpoint to delete one or more custom attributes from one or more orders.
A custom attribute is based on a custom attribute definition in a Square seller account.  (To create a
custom attribute definition, use the [CreateOrderCustomAttributeDefinition](../../doc/api/order-custom-attributes.md#create-order-custom-attribute-definition) endpoint.)

This `BulkUpsertOrderCustomAttributes` endpoint accepts a map of 1 to 25 individual upsert
requests and returns a map of individual upsert responses. Each upsert request has a unique ID
and provides an order ID and custom attribute. Each upsert response is returned with the ID
of the corresponding request.

To create or update a custom attribute owned by another application, the `visibility` setting
must be `VISIBILITY_READ_WRITE_VALUES`. Note that seller-defined custom attributes
(also known as custom fields) are always set to `VISIBILITY_READ_WRITE_VALUES`.

```ts
async bulkUpsertOrderCustomAttributes(
  body: BulkUpsertOrderCustomAttributesRequest,
  requestOptions?: RequestOptions
): Promise<ApiResponse<BulkUpsertOrderCustomAttributesResponse>>
```
