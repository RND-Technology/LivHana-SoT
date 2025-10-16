## Example Usage

```ts
const body: CreateTerminalRefundRequest = {
  idempotencyKey: '402a640b-b26f-401f-b406-46f839590c04',
  refund: {
    paymentId: '5O5OvgkcNUhl7JBuINflcjKqUzXZY',
    amountMoney: {
      amount: BigInt(111),
      currency: 'CAD',
    },
    reason: 'Returning items',
    deviceId: 'f72dfb8e-4d65-4e56-aade-ec3fb8d33291',
  },
};

try {
  const { result, ...httpResponse } = await terminalApi.createTerminalRefund(body);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Search Terminal Refunds

Retrieves a filtered list of Interac Terminal refund requests created by the seller making the request. Terminal refund requests are available for 30 days.

```ts
async searchTerminalRefunds(
  body: SearchTerminalRefundsRequest,
  requestOptions?: RequestOptions
): Promise<ApiResponse<SearchTerminalRefundsResponse>>
```
