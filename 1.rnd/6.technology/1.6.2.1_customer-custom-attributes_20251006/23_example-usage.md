## Example Usage

```ts
const customerId = 'customer_id8';

const withDefinitions = false;

try {
  const { result, ...httpResponse } = await customerCustomAttributesApi.listCustomerCustomAttributes(
  customerId,
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

# Delete Customer Custom Attribute

Deletes a [custom attribute](../../doc/models/custom-attribute.md) associated with a customer profile.

To delete a custom attribute owned by another application, the `visibility` setting must be
`VISIBILITY_READ_WRITE_VALUES`. Note that seller-defined custom attributes
(also known as custom fields) are always set to `VISIBILITY_READ_WRITE_VALUES`.

```ts
async deleteCustomerCustomAttribute(
  customerId: string,
  key: string,
  requestOptions?: RequestOptions
): Promise<ApiResponse<DeleteCustomerCustomAttributeResponse>>
```
