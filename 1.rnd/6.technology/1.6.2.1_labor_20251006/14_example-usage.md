## Example Usage

```ts
const id = 'id0';

try {
  const { result, ...httpResponse } = await laborApi.getBreakType(id);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Update Break Type

Updates an existing `BreakType`.

```ts
async updateBreakType(
  id: string,
  body: UpdateBreakTypeRequest,
  requestOptions?: RequestOptions
): Promise<ApiResponse<UpdateBreakTypeResponse>>
```
