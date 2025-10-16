## Example Usage

```ts
const body: SearchLoyaltyAccountsRequest = {
  query: {
    mappings: [
      {
        phoneNumber: '+14155551234',
      }
    ],
  },
  limit: 10,
};

try {
  const { result, ...httpResponse } = await loyaltyApi.searchLoyaltyAccounts(body);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Retrieve Loyalty Account

Retrieves a loyalty account.

```ts
async retrieveLoyaltyAccount(
  accountId: string,
  requestOptions?: RequestOptions
): Promise<ApiResponse<RetrieveLoyaltyAccountResponse>>
```
