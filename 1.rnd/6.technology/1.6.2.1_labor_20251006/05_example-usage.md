## Example Usage

```ts
try {
  const { result, ...httpResponse } = await laborApi.listBreakTypes();
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Create Break Type

Creates a new `BreakType`.

A `BreakType` is a template for creating `Break` objects.
You must provide the following values in your request to this
endpoint:

* `location_id`
* `break_name`
* `expected_duration`
* `is_paid`

You can only have three `BreakType` instances per location. If you attempt to add a fourth
`BreakType` for a location, an `INVALID_REQUEST_ERROR` "Exceeded limit of 3 breaks per location."
is returned.

```ts
async createBreakType(
  body: CreateBreakTypeRequest,
  requestOptions?: RequestOptions
): Promise<ApiResponse<CreateBreakTypeResponse>>
```
