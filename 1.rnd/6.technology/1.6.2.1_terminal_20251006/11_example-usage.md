## Example Usage

```ts
const actionId = 'action_id6';

try {
  const { result, ...httpResponse } = await terminalApi.getTerminalAction(actionId);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Cancel Terminal Action

Cancels a Terminal action request if the status of the request permits it.

```ts
async cancelTerminalAction(
  actionId: string,
  requestOptions?: RequestOptions
): Promise<ApiResponse<CancelTerminalActionResponse>>
```
