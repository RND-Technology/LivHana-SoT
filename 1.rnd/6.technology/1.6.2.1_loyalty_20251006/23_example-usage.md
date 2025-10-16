## Example Usage

```ts
try {
  const { result, ...httpResponse } = await loyaltyApi.listLoyaltyPrograms();
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Retrieve Loyalty Program

Retrieves the loyalty program in a seller's account, specified by the program ID or the keyword `main`.

Loyalty programs define how buyers can earn points and redeem points for rewards. Square sellers can have only one loyalty program, which is created and managed from the Seller Dashboard. For more information, see [Loyalty Program Overview](https://developer.squareup.com/docs/loyalty/overview).

```ts
async retrieveLoyaltyProgram(
  programId: string,
  requestOptions?: RequestOptions
): Promise<ApiResponse<RetrieveLoyaltyProgramResponse>>
```
