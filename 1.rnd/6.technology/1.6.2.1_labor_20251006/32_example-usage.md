## Example Usage

```ts
const id = 'id0';

try {
  const { result, ...httpResponse } = await laborApi.deleteShift(id);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Get Shift

Returns a single `Shift` specified by `id`.

```ts
async getShift(
  id: string,
  requestOptions?: RequestOptions
): Promise<ApiResponse<GetShiftResponse>>
```
