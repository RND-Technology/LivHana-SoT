## Example Usage

```ts
const customerId = 'customer_id8';

const key = 'key0';

const withDefinition = false;

try {
  const { result, ...httpResponse } = await customerCustomAttributesApi.retrieveCustomerCustomAttribute(
  customerId,
  key,
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

# Upsert Customer Custom Attribute

Creates or updates a [custom attribute](../../doc/models/custom-attribute.md) for a customer profile.

Use this endpoint to set the value of a custom attribute for a specified customer profile.
A custom attribute is based on a custom attribute definition in a Square seller account, which
is created using the [CreateCustomerCustomAttributeDefinition](../../doc/api/customer-custom-attributes.md#create-customer-custom-attribute-definition) endpoint.

To create or update a custom attribute owned by another application, the `visibility` setting
must be `VISIBILITY_READ_WRITE_VALUES`. Note that seller-defined custom attributes
(also known as custom fields) are always set to `VISIBILITY_READ_WRITE_VALUES`.

```ts
async upsertCustomerCustomAttribute(
  customerId: string,
  key: string,
  body: UpsertCustomerCustomAttributeRequest,
  requestOptions?: RequestOptions
): Promise<ApiResponse<UpsertCustomerCustomAttributeResponse>>
```
