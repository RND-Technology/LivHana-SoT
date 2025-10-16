## Example Usage

```ts
const body: BulkUpdateCustomersRequest = {
  customers: {
    '8DDA5NZVBZFGAX0V3HPF81HHE0': {
      emailAddress: 'New.Amelia.Earhart@example.com',
      phoneNumber: 'phone_number2',
      note: 'updated customer note',
      version: BigInt(2),
    },
    'N18CPRVXR5214XPBBA6BZQWF3C': {
      givenName: 'Marie',
      familyName: 'Curie',
      version: BigInt(0),
    }
  },
};

try {
  const { result, ...httpResponse } = await customersApi.bulkUpdateCustomers(body);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Search Customers

Searches the customer profiles associated with a Square account using one or more supported query filters.

Calling `SearchCustomers` without any explicit query filter returns all
customer profiles ordered alphabetically based on `given_name` and
`family_name`.

Under normal operating conditions, newly created or updated customer profiles become available
for the search operation in well under 30 seconds. Occasionally, propagation of the new or updated
profiles can take closer to one minute or longer, especially during network incidents and outages.

```ts
async searchCustomers(
  body: SearchCustomersRequest,
  requestOptions?: RequestOptions
): Promise<ApiResponse<SearchCustomersResponse>>
```
