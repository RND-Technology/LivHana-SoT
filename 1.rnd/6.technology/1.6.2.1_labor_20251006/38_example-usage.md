## Example Usage

```ts
const id = 'id0';

const body: UpdateShiftRequest = {
  shift: {
    locationId: 'PAA1RJZZKXBFG',
    startAt: '2019-01-25T03:11:00-05:00',
    endAt: '2019-01-25T13:11:00-05:00',
    wage: {
      title: 'Bartender',
      hourlyRate: {
        amount: BigInt(1500),
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
        id: 'X7GAQYVVRRG6P',
        endAt: '2019-01-25T06:16:00-05:00',
      }
    ],
    version: 1,
    teamMemberId: 'ormj0jJJZ5OZIzxrZYJI',
    declaredCashTipMoney: {
      amount: BigInt(500),
      currency: 'USD',
    },
  },
};

try {
  const { result, ...httpResponse } = await laborApi.updateShift(
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

# List Team Member Wages

Returns a paginated list of `TeamMemberWage` instances for a business.

```ts
async listTeamMemberWages(
  teamMemberId?: string,
  limit?: number,
  cursor?: string,
  requestOptions?: RequestOptions
): Promise<ApiResponse<ListTeamMemberWagesResponse>>
```
