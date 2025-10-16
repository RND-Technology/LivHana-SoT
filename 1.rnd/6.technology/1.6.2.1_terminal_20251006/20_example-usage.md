## Example Usage

```ts
const body: CreateTerminalCheckoutRequest = {
  idempotencyKey: '28a0c3bc-7839-11ea-bc55-0242ac130003',
  checkout: {
    amountMoney: {
      amount: BigInt(2610),
      currency: 'USD',
    },
    deviceOptions: {
      deviceId: 'dbb5d83a-7838-11ea-bc55-0242ac130003',
    },
    referenceId: 'id11572',
    note: 'A brief note',
  },
};

try {
  const { result, ...httpResponse } = await terminalApi.createTerminalCheckout(body);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Search Terminal Checkouts

Returns a filtered list of Terminal checkout requests created by the application making the request. Only Terminal checkout requests created for the merchant scoped to the OAuth token are returned. Terminal checkout requests are available for 30 days.

```ts
async searchTerminalCheckouts(
  body: SearchTerminalCheckoutsRequest,
  requestOptions?: RequestOptions
): Promise<ApiResponse<SearchTerminalCheckoutsResponse>>
```
