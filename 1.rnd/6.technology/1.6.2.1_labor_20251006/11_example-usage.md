## Example Usage

```ts
const id = 'id0';

try {
  const { result, ...httpResponse } = await laborApi.deleteBreakType(id);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Get Break Type

Returns a single `BreakType` specified by `id`.

```ts
async getBreakType(
  id: string,
  requestOptions?: RequestOptions
): Promise<ApiResponse<GetBreakTypeResponse>>
```
