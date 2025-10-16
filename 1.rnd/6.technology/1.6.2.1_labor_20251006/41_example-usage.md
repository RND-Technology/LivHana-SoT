## Example Usage

```ts
try {
  const { result, ...httpResponse } = await laborApi.listTeamMemberWages();
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Get Team Member Wage

Returns a single `TeamMemberWage` specified by `id`.

```ts
async getTeamMemberWage(
  id: string,
  requestOptions?: RequestOptions
): Promise<ApiResponse<GetTeamMemberWageResponse>>
```
