## Example Usage

```ts
const promotionId = 'promotion_id0';

const programId = 'program_id0';

try {
  const { result, ...httpResponse } = await loyaltyApi.retrieveLoyaltyPromotion(
  promotionId,
  programId
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

# Cancel Loyalty Promotion

Cancels a loyalty promotion. Use this endpoint to cancel an `ACTIVE` promotion earlier than the
end date, cancel an `ACTIVE` promotion when an end date is not specified, or cancel a `SCHEDULED` promotion.
Because updating a promotion is not supported, you can also use this endpoint to cancel a promotion before
you create a new one.

This endpoint sets the loyalty promotion to the `CANCELED` state

```ts
async cancelLoyaltyPromotion(
  promotionId: string,
  programId: string,
  requestOptions?: RequestOptions
): Promise<ApiResponse<CancelLoyaltyPromotionResponse>>
```
