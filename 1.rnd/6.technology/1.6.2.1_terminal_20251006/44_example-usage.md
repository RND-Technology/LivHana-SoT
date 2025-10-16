## Example Usage

```ts
const terminalRefundId = 'terminal_refund_id0';

try {
  const { result, ...httpResponse } = await terminalApi.cancelTerminalRefund(terminalRefundId);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Dismiss Terminal Refund

Dismisses a Terminal refund request if the status and type of the request permits it.

```ts
async dismissTerminalRefund(
  terminalRefundId: string,
  requestOptions?: RequestOptions
): Promise<ApiResponse<DismissTerminalRefundResponse>>
```
