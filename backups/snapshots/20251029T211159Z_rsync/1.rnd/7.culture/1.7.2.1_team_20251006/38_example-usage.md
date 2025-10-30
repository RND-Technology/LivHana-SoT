## Example Usage

```ts
const teamMemberId = 'team_member_id0';

const body: UpdateWageSettingRequest = {
  wageSetting: {
    jobAssignments: [
      {
        payType: 'SALARY',
        jobTitle: 'Manager',
        annualRate: {
          amount: BigInt(3000000),
          currency: 'USD',
        },
        weeklyHours: 40,
      },
      {
        payType: 'HOURLY',
        jobTitle: 'Cashier',
        hourlyRate: {
          amount: BigInt(2000),
          currency: 'USD',
        },
      }
    ],
    isOvertimeExempt: true,
  },
};

try {
  const { result, ...httpResponse } = await teamApi.updateWageSetting(
  teamMemberId,
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
