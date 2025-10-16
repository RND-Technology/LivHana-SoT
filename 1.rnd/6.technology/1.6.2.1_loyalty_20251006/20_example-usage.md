## Example Usage

```ts
const body: SearchLoyaltyEventsRequest = {
  query: {
    filter: {
      orderFilter: {
        orderId: 'PyATxhYLfsMqpVkcKJITPydgEYfZY',
      },
    },
  },
  limit: 30,
};

try {
  const { result, ...httpResponse } = await loyaltyApi.searchLoyaltyEvents(body);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# List Loyalty Programs

**This endpoint is deprecated.**

Returns a list of loyalty programs in the seller's account.
Loyalty programs define how buyers can earn points and redeem points for rewards. Square sellers can have only one loyalty program, which is created and managed from the Seller Dashboard. For more information, see [Loyalty Program Overview](https://developer.squareup.com/docs/loyalty/overview).

Replaced with [RetrieveLoyaltyProgram](api-endpoint:Loyalty-RetrieveLoyaltyProgram) when used with the keyword `main`.

```ts
async listLoyaltyPrograms(
  requestOptions?: RequestOptions
): Promise<ApiResponse<ListLoyaltyProgramsResponse>>
```
