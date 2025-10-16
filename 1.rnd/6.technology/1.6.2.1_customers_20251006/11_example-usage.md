## Example Usage

```ts
const body: BulkCreateCustomersRequest = {
  customers: {
    '8bb76c4f-e35d-4c5b-90de-1194cd9179f0': {
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
    },
    'd1689f23-b25d-4932-b2f0-aed00f5e2029': {
      givenName: 'Marie',
      familyName: 'Curie',
      emailAddress: 'Marie.Curie@example.com',
      address: {
        addressLine1: '500 Electric Ave',
        addressLine2: 'Suite 601',
        locality: 'New York',
        administrativeDistrictLevel1: 'NY',
        postalCode: '10003',
        country: 'US',
      },
      phoneNumber: '+1-212-444-4240',
      referenceId: 'YOUR_REFERENCE_ID',
      note: 'another customer',
    }
  },
};

try {
  const { result, ...httpResponse } = await customersApi.bulkCreateCustomers(body);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Bulk Delete Customers

Deletes multiple customer profiles.

The endpoint takes a list of customer IDs and returns a map of responses.

```ts
async bulkDeleteCustomers(
  body: BulkDeleteCustomersRequest,
  requestOptions?: RequestOptions
): Promise<ApiResponse<BulkDeleteCustomersResponse>>
```
