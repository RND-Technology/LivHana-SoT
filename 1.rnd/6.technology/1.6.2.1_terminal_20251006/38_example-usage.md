## Example Usage

```ts
const body: SearchTerminalRefundsRequest = {
  query: {
    filter: {
      status: 'COMPLETED',
    },
  },
  limit: 1,
};

try {
  const { result, ...httpResponse } = await terminalApi.searchTerminalRefunds(body);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Get Terminal Refund

Retrieves an Interac Terminal refund object by ID. Terminal refund objects are available for 30 days.

```ts
async getTerminalRefund(
  terminalRefundId: string,
  requestOptions?: RequestOptions
): Promise<ApiResponse<GetTerminalRefundResponse>>
```
