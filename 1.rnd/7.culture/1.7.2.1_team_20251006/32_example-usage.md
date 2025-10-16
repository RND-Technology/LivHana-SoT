## Example Usage

```ts
const teamMemberId = 'team_member_id0';

const body: UpdateTeamMemberRequest = {
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
  },
};

try {
  const { result, ...httpResponse } = await teamApi.updateTeamMember(
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

# Retrieve Wage Setting

Retrieves a `WageSetting` object for a team member specified
by `TeamMember.id`. For more information, see
[Troubleshooting the Team API](https://developer.squareup.com/docs/team/troubleshooting#retrievewagesetting).

Square recommends using [RetrieveTeamMember](../../doc/api/team.md#retrieve-team-member) or [SearchTeamMembers](../../doc/api/team.md#search-team-members)
to get this information directly from the `TeamMember.wage_setting` field.

```ts
async retrieveWageSetting(
  teamMemberId: string,
  requestOptions?: RequestOptions
): Promise<ApiResponse<RetrieveWageSettingResponse>>
```
