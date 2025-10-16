## Example Usage

```ts
const body: SearchShiftsRequest = {
  query: {
    filter: {
      workday: {
        dateRange: {
          startDate: '2019-01-20',
          endDate: '2019-02-03',
        },
        matchShiftsBy: 'START_AT',
        defaultTimezone: 'America/Los_Angeles',
      },
    },
  },
  limit: 100,
};

try {
  const { result, ...httpResponse } = await laborApi.searchShifts(body);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Delete Shift

Deletes a `Shift`.

```ts
async deleteShift(
  id: string,
  requestOptions?: RequestOptions
): Promise<ApiResponse<DeleteShiftResponse>>
```
