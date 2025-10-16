## Example Usage

```ts
const body: CreateBreakTypeRequest = {
  breakType: {
    locationId: 'CGJN03P1D08GF',
    breakName: 'Lunch Break',
    expectedDuration: 'PT30M',
    isPaid: true,
  },
  idempotencyKey: 'PAD3NG5KSN2GL',
};

try {
  const { result, ...httpResponse } = await laborApi.createBreakType(body);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Delete Break Type

Deletes an existing `BreakType`.

A `BreakType` can be deleted even if it is referenced from a `Shift`.

```ts
async deleteBreakType(
  id: string,
  requestOptions?: RequestOptions
): Promise<ApiResponse<DeleteBreakTypeResponse>>
```
