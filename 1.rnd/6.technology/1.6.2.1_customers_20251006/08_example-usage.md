## Example Usage

```ts
const body: CreateCustomerRequest = {
  givenName: 'Amelia',
  familyName: 'Earhart',
  emailAddress: 'Amelia.Earhart@example.com',
  address: {
    addressLine1: '500 Electric Ave',
    addressLine2: 'Suite 600',
    locality: 'New York',
    administrativeDistrictLevel1: 'NY',
    postalCode: '10003',
    country: 'US',
  },
  phoneNumber: '+1-212-555-4240',
  referenceId: 'YOUR_REFERENCE_ID',
  note: 'a customer',
};

try {
  const { result, ...httpResponse } = await customersApi.createCustomer(body);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Bulk Create Customers

Creates multiple [customer profiles](../../doc/models/customer.md) for a business.

This endpoint takes a map of individual create requests and returns a map of responses.

You must provide at least one of the following values in each create request:

* `given_name`
* `family_name`
* `company_name`
* `email_address`
* `phone_number`

```ts
async bulkCreateCustomers(
  body: BulkCreateCustomersRequest,
  requestOptions?: RequestOptions
): Promise<ApiResponse<BulkCreateCustomersResponse>>
```
