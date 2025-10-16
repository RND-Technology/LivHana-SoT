## Example Usage

```ts
const id = 'id0';

try {
  const { result, ...httpResponse } = await laborApi.getTeamMemberWage(id);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# List Workweek Configs

Returns a list of `WorkweekConfig` instances for a business.

```ts
async listWorkweekConfigs(
  limit?: number,
  cursor?: string,
  requestOptions?: RequestOptions
): Promise<ApiResponse<ListWorkweekConfigsResponse>>
```
