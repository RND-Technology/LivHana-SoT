## Example Usage

```ts
const actionId = 'action_id6';

try {
  const { result, ...httpResponse } = await terminalApi.cancelTerminalAction(actionId);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Dismiss Terminal Action

Dismisses a Terminal action request if the status and type of the request permits it.

See [Link and Dismiss Actions](https://developer.squareup.com/docs/terminal-api/advanced-features/custom-workflows/link-and-dismiss-actions) for more details.

```ts
async dismissTerminalAction(
  actionId: string,
  requestOptions?: RequestOptions
): Promise<ApiResponse<DismissTerminalActionResponse>>
```
