## Example Usage

```ts
const id = 'id0';

const body: UpdateBreakTypeRequest = {
  breakType: {
    locationId: '26M7H24AZ9N6R',
    breakName: 'Lunch',
    expectedDuration: 'PT50M',
    isPaid: true,
    version: 1,
  },
};

try {
  const { result, ...httpResponse } = await laborApi.updateBreakType(
  id,
  body
);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# List Employee Wages

**This endpoint is deprecated.**

Returns a paginated list of `EmployeeWage` instances for a business.

```ts
async listEmployeeWages(
  employeeId?: string,
  limit?: number,
  cursor?: string,
  requestOptions?: RequestOptions
): Promise<ApiResponse<ListEmployeeWagesResponse>>
```
