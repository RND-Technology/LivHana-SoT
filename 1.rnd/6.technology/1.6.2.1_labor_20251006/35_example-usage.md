## Example Usage

```ts
const id = 'id0';

try {
  const { result, ...httpResponse } = await laborApi.getShift(id);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Update Shift

Updates an existing `Shift`.

When adding a `Break` to a `Shift`, any earlier `Break` instances in the `Shift` have
the `end_at` property set to a valid RFC-3339 datetime string.

When closing a `Shift`, all `Break` instances in the `Shift` must be complete with `end_at`
set on each `Break`.

```ts
async updateShift(
  id: string,
  body: UpdateShiftRequest,
  requestOptions?: RequestOptions
): Promise<ApiResponse<UpdateShiftResponse>>
```
