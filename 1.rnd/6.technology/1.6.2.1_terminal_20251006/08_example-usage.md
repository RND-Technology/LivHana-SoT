## Example Usage

```ts
const body: SearchTerminalActionsRequest = {
  query: {
    filter: {
      createdAt: {
        startAt: '2022-04-01T00:00:00.000Z',
      },
    },
    sort: {
      sortOrder: 'DESC',
    },
  },
  limit: 2,
};

try {
  const { result, ...httpResponse } = await terminalApi.searchTerminalActions(body);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Get Terminal Action

Retrieves a Terminal action request by `action_id`. Terminal action requests are available for 30 days.

```ts
async getTerminalAction(
  actionId: string,
  requestOptions?: RequestOptions
): Promise<ApiResponse<GetTerminalActionResponse>>
```
