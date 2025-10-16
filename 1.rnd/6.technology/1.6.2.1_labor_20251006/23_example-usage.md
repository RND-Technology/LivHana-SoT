## Example Usage

```ts
const id = 'id0';

try {
  const { result, ...httpResponse } = await laborApi.getEmployeeWage(id);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Create Shift

Creates a new `Shift`.

A `Shift` represents a complete workday for a single team member.
You must provide the following values in your request to this
endpoint:

* `location_id`
* `team_member_id`
* `start_at`

An attempt to create a new `Shift` can result in a `BAD_REQUEST` error when:

* The `status` of the new `Shift` is `OPEN` and the team member has another
  shift with an `OPEN` status.
* The `start_at` date is in the future.
* The `start_at` or `end_at` date overlaps another shift for the same team member.
* The `Break` instances are set in the request and a break `start_at`
  is before the `Shift.start_at`, a break `end_at` is after
  the `Shift.end_at`, or both.

```ts
async createShift(
  body: CreateShiftRequest,
  requestOptions?: RequestOptions
): Promise<ApiResponse<CreateShiftResponse>>
```
