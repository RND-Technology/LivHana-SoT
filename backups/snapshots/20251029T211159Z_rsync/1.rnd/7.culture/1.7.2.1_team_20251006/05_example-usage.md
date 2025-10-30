## Example Usage

```ts
const body: CreateTeamMemberRequest = {
  idempotencyKey: 'idempotency-key-0',
  teamMember: {
    referenceId: 'reference_id_1',
    status: 'ACTIVE',
    givenName: 'Joe',
    familyName: 'Doe',
    emailAddress: 'joe_doe@gmail.com',
    phoneNumber: '+14159283333',
    assignedLocations: {
      assignmentType: 'EXPLICIT_LOCATIONS',
      locationIds: [
        'YSGH2WBKG94QZ',
        'GA2Y9HSJ8KRYT'
      ],
    },
    wageSetting: {
      jobAssignments: [
        {
          payType: 'SALARY',
          annualRate: {
            amount: BigInt(3000000),
            currency: 'USD',
          },
          weeklyHours: 40,
          jobId: 'FjS8x95cqHiMenw4f1NAUH4P',
        },
        {
          payType: 'HOURLY',
          hourlyRate: {
            amount: BigInt(2000),
            currency: 'USD',
          },
          jobId: 'VDNpRv8da51NU8qZFC5zDWpF',
        }
      ],
      isOvertimeExempt: true,
    },
  },
};

try {
  const { result, ...httpResponse } = await teamApi.createTeamMember(body);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Bulk Create Team Members

Creates multiple `TeamMember` objects. The created `TeamMember` objects are returned on successful creates.
This process is non-transactional and processes as much of the request as possible. If one of the creates in
the request cannot be successfully processed, the request is not marked as failed, but the body of the response
contains explicit error information for the failed create.

Learn about [Troubleshooting the Team API](https://developer.squareup.com/docs/team/troubleshooting#bulk-create-team-members).

```ts
async bulkCreateTeamMembers(
  body: BulkCreateTeamMembersRequest,
  requestOptions?: RequestOptions
): Promise<ApiResponse<BulkCreateTeamMembersResponse>>
```
