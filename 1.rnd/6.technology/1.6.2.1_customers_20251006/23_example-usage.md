## Example Usage

```ts
const body: SearchCustomersRequest = {
  limit: BigInt(2),
  query: {
    filter: {
      creationSource: {
        values: [
          'THIRD_PARTY'
        ],
        rule: 'INCLUDE',
      },
      createdAt: {
        startAt: '2018-01-01T00:00:00-00:00',
        endAt: '2018-02-01T00:00:00-00:00',
      },
      emailAddress: {
        fuzzy: 'example.com',
      },
      groupIds: {
        all: [
          '545AXB44B4XXWMVQ4W8SBT3HHF'
        ],
      },
    },
    sort: {
      field: 'CREATED_AT',
      order: 'ASC',
    },
  },
};

try {
  const { result, ...httpResponse } = await customersApi.searchCustomers(body);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Delete Customer

Deletes a customer profile from a business. This operation also unlinks any associated cards on file.

To delete a customer profile that was created by merging existing profiles, you must use the ID of the newly created profile.

```ts
async deleteCustomer(
  customerId: string,
  version?: bigint,
  requestOptions?: RequestOptions
): Promise<ApiResponse<DeleteCustomerResponse>>
```
