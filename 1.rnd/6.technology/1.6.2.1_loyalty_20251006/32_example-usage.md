## Example Usage

```ts
const programId = 'program_id0';

try {
  const { result, ...httpResponse } = await loyaltyApi.listLoyaltyPromotions(programId);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Create Loyalty Promotion

Creates a loyalty promotion for a [loyalty program](../../doc/models/loyalty-program.md). A loyalty promotion
enables buyers to earn points in addition to those earned from the base loyalty program.

This endpoint sets the loyalty promotion to the `ACTIVE` or `SCHEDULED` status, depending on the
`available_time` setting. A loyalty program can have a maximum of 10 loyalty promotions with an
`ACTIVE` or `SCHEDULED` status.

```ts
async createLoyaltyPromotion(
  programId: string,
  body: CreateLoyaltyPromotionRequest,
  requestOptions?: RequestOptions
): Promise<ApiResponse<CreateLoyaltyPromotionResponse>>
```
