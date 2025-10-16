## Example Usage

```ts
const customerId = 'customer_id8';

const key = 'key0';

try {
  const { result, ...httpResponse } = await customerCustomAttributesApi.deleteCustomerCustomAttribute(
  customerId,
  key
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

# Retrieve Customer Custom Attribute

Retrieves a [custom attribute](../../doc/models/custom-attribute.md) associated with a customer profile.

You can use the `with_definition` query parameter to also retrieve the custom attribute definition
in the same call.

To retrieve a custom attribute owned by another application, the `visibility` setting must be
`VISIBILITY_READ_ONLY` or `VISIBILITY_READ_WRITE_VALUES`. Note that seller-defined custom attributes
(also known as custom fields) are always set to `VISIBILITY_READ_WRITE_VALUES`.

```ts
async retrieveCustomerCustomAttribute(
  customerId: string,
  key: string,
  withDefinition?: boolean,
  version?: number,
  requestOptions?: RequestOptions
): Promise<ApiResponse<RetrieveCustomerCustomAttributeResponse>>
```
