## Example Usage

```ts
const body: CreateLoyaltyAccountRequest = {
  loyaltyAccount: {
    programId: 'd619f755-2d17-41f3-990d-c04ecedd64dd',
    mapping: {
      phoneNumber: '+14155551234',
    },
  },
  idempotencyKey: 'ec78c477-b1c3-4899-a209-a4e71337c996',
};

try {
  const { result, ...httpResponse } = await loyaltyApi.createLoyaltyAccount(body);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Search Loyalty Accounts

Searches for loyalty accounts in a loyalty program.

You can search for a loyalty account using the phone number or customer ID associated with the account. To return all loyalty accounts, specify an empty `query` object or omit it entirely.

Search results are sorted by `created_at` in ascending order.

```ts
async searchLoyaltyAccounts(
  body: SearchLoyaltyAccountsRequest,
  requestOptions?: RequestOptions
): Promise<ApiResponse<SearchLoyaltyAccountsResponse>>
```
