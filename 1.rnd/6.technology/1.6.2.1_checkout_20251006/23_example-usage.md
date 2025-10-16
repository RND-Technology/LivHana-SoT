## Example Usage

```ts
const body: CreatePaymentLinkRequest = {
  idempotencyKey: 'cd9e25dc-d9f2-4430-aedb-61605070e95f',
  quickPay: {
    name: 'Auto Detailing',
    priceMoney: {
      amount: BigInt(10000),
      currency: 'USD',
    },
    locationId: 'A9Y43N9ABXZBP',
  },
};

try {
  const { result, ...httpResponse } = await checkoutApi.createPaymentLink(body);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Delete Payment Link

Deletes a payment link.

```ts
async deletePaymentLink(
  id: string,
  requestOptions?: RequestOptions
): Promise<ApiResponse<DeletePaymentLinkResponse>>
```
