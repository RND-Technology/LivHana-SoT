## Example Usage

```ts
try {
  const { result, ...httpResponse } = await laborApi.listWorkweekConfigs();
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Update Workweek Config

Updates a `WorkweekConfig`.

```ts
async updateWorkweekConfig(
  id: string,
  body: UpdateWorkweekConfigRequest,
  requestOptions?: RequestOptions
): Promise<ApiResponse<UpdateWorkweekConfigResponse>>
```
