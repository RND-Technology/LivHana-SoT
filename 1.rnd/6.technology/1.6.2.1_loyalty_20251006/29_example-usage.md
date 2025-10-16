## Example Usage

```ts
const programId = 'program_id0';

const body: CalculateLoyaltyPointsRequest = {
  orderId: 'RFZfrdtm3mhO1oGzf5Cx7fEMsmGZY',
  loyaltyAccountId: '79b807d2-d786-46a9-933b-918028d7a8c5',
};

try {
  const { result, ...httpResponse } = await loyaltyApi.calculateLoyaltyPoints(
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

# List Loyalty Promotions

Lists the loyalty promotions associated with a [loyalty program](../../doc/models/loyalty-program.md).
Results are sorted by the `created_at` date in descending order (newest to oldest).

```ts
async listLoyaltyPromotions(
  programId: string,
  status?: string,
  cursor?: string,
  limit?: number,
  requestOptions?: RequestOptions
): Promise<ApiResponse<ListLoyaltyPromotionsResponse>>
```
