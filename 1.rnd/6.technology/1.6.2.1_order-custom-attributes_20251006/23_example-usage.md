## Example Usage

```ts
const body: BulkUpsertOrderCustomAttributesRequest = {
  values: {
    'key0': {
      customAttribute: {
      },
      orderId: 'order_id4',
    },
    'key1': {
      customAttribute: {
      },
      orderId: 'order_id4',
    }
  },
};

try {
  const { result, ...httpResponse } = await orderCustomAttributesApi.bulkUpsertOrderCustomAttributes(body);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# List Order Custom Attributes

Lists the [custom attributes](../../doc/models/custom-attribute.md) associated with an order.

You can use the `with_definitions` query parameter to also retrieve custom attribute definitions
in the same call.

When all response pages are retrieved, the results include all custom attributes that are
visible to the requesting application, including those that are owned by other applications
and set to `VISIBILITY_READ_ONLY` or `VISIBILITY_READ_WRITE_VALUES`.

```ts
async listOrderCustomAttributes(
  orderId: string,
  visibilityFilter?: string,
  cursor?: string,
  limit?: number,
  withDefinitions?: boolean,
  requestOptions?: RequestOptions
): Promise<ApiResponse<ListOrderCustomAttributesResponse>>
```
