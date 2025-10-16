## Example Usage

```ts
const body: CreateShiftRequest = {
  shift: {
    locationId: 'PAA1RJZZKXBFG',
    startAt: '2019-01-25T03:11:00-05:00',
    endAt: '2019-01-25T13:11:00-05:00',
    wage: {
      title: 'Barista',
      hourlyRate: {
        amount: BigInt(1100),
        currency: 'USD',
      },
      tipEligible: true,
    },
    breaks: [
      {
        startAt: '2019-01-25T06:11:00-05:00',
        breakTypeId: 'REGS1EQR1TPZ5',
        name: 'Tea Break',
        expectedDuration: 'PT5M',
        isPaid: true,
        endAt: '2019-01-25T06:16:00-05:00',
      }
    ],
    teamMemberId: 'ormj0jJJZ5OZIzxrZYJI',
    declaredCashTipMoney: {
      amount: BigInt(500),
      currency: 'USD',
    },
  },
  idempotencyKey: 'HIDSNG5KS478L',
};

try {
  const { result, ...httpResponse } = await laborApi.createShift(body);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Search Shifts

Returns a paginated list of `Shift` records for a business.
The list to be returned can be filtered by:

* Location IDs
* Team member IDs
* Shift status (`OPEN` or `CLOSED`)
* Shift start
* Shift end
* Workday details

The list can be sorted by:

* `START_AT`
* `END_AT`
* `CREATED_AT`
* `UPDATED_AT`

```ts
async searchShifts(
  body: SearchShiftsRequest,
  requestOptions?: RequestOptions
): Promise<ApiResponse<SearchShiftsResponse>>
```
