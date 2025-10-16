## Example Usage

```ts
try {
  const { result, ...httpResponse } = await laborApi.listEmployeeWages();
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Get Employee Wage

**This endpoint is deprecated.**

Returns a single `EmployeeWage` specified by `id`.

```ts
async getEmployeeWage(
  id: string,
  requestOptions?: RequestOptions
): Promise<ApiResponse<GetEmployeeWageResponse>>
```
