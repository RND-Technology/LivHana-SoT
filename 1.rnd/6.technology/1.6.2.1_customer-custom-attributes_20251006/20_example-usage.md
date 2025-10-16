## Example Usage

```ts
const body: BulkUpsertCustomerCustomAttributesRequest = {
  values: {
    'key0': {
      customerId: 'customer_id8',
      customAttribute: {
      },
    },
    'key1': {
      customerId: 'customer_id8',
      customAttribute: {
      },
    }
  },
};

try {
  const { result, ...httpResponse } = await customerCustomAttributesApi.bulkUpsertCustomerCustomAttributes(body);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# List Customer Custom Attributes

Lists the [custom attributes](../../doc/models/custom-attribute.md) associated with a customer profile.

You can use the `with_definitions` query parameter to also retrieve custom attribute definitions
in the same call.

When all response pages are retrieved, the results include all custom attributes that are
visible to the requesting application, including those that are owned by other applications
and set to `VISIBILITY_READ_ONLY` or `VISIBILITY_READ_WRITE_VALUES`.

```ts
async listCustomerCustomAttributes(
  customerId: string,
  limit?: number,
  cursor?: string,
  withDefinitions?: boolean,
  requestOptions?: RequestOptions
): Promise<ApiResponse<ListCustomerCustomAttributesResponse>>
```
