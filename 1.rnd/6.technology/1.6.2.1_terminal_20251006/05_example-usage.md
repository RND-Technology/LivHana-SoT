## Example Usage

```ts
const body: CreateTerminalActionRequest = {
  idempotencyKey: 'thahn-70e75c10-47f7-4ab6-88cc-aaa4076d065e',
  action: {
    deviceId: '{{DEVICE_ID}}',
    deadlineDuration: 'PT5M',
    type: 'SAVE_CARD',
    saveCardOptions: {
      customerId: '{{CUSTOMER_ID}}',
      referenceId: 'user-id-1',
    },
  },
};

try {
  const { result, ...httpResponse } = await terminalApi.createTerminalAction(body);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Search Terminal Actions

Retrieves a filtered list of Terminal action requests created by the account making the request. Terminal action requests are available for 30 days.

```ts
async searchTerminalActions(
  body: SearchTerminalActionsRequest,
  requestOptions?: RequestOptions
): Promise<ApiResponse<SearchTerminalActionsResponse>>
```
