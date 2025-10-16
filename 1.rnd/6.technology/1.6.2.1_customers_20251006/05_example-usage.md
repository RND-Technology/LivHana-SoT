## Example Usage

```ts
const count = false;

try {
  const { result, ...httpResponse } = await customersApi.listCustomers(
  undefined,
  undefined,
  undefined,
  undefined,
  count
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

# Create Customer

Creates a new customer for a business.

You must provide at least one of the following values in your request to this
endpoint:

* `given_name`
* `family_name`
* `company_name`
* `email_address`
* `phone_number`

```ts
async createCustomer(
  body: CreateCustomerRequest,
  requestOptions?: RequestOptions
): Promise<ApiResponse<CreateCustomerResponse>>
```
