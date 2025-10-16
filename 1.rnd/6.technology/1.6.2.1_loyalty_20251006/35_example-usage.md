## Example Usage

```ts
const programId = 'program_id0';

const body: CreateLoyaltyPromotionRequest = {
  loyaltyPromotion: {
    name: 'Tuesday Happy Hour Promo',
    incentive: {
      type: 'POINTS_MULTIPLIER',
      pointsMultiplierData: {
        multiplier: '3.0',
      },
    },
    availableTime: {
      timePeriods: [
        'BEGIN:VEVENT\nDTSTART:20220816T160000\nDURATION:PT2H\nRRULE:FREQ=WEEKLY;BYDAY=TU\nEND:VEVENT'
      ],
    },
    triggerLimit: {
      times: 1,
      interval: 'DAY',
    },
    minimumSpendAmountMoney: {
      amount: BigInt(2000),
      currency: 'USD',
    },
    qualifyingCategoryIds: [
      'XTQPYLR3IIU9C44VRCB3XD12'
    ],
  },
  idempotencyKey: 'ec78c477-b1c3-4899-a209-a4e71337c996',
};

try {
  const { result, ...httpResponse } = await loyaltyApi.createLoyaltyPromotion(
  programId,
  body
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

# Retrieve Loyalty Promotion

Retrieves a loyalty promotion.

```ts
async retrieveLoyaltyPromotion(
  promotionId: string,
  programId: string,
  requestOptions?: RequestOptions
): Promise<ApiResponse<RetrieveLoyaltyPromotionResponse>>
```
