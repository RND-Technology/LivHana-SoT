## Example Usage

```ts
const terminalRefundId = 'terminal_refund_id0';

try {
  const { result, ...httpResponse } = await terminalApi.dismissTerminalRefund(terminalRefundId);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```
