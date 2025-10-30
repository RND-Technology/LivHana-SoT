## Example Usage

```ts
const teamMemberId = 'team_member_id0';

try {
  const { result, ...httpResponse } = await teamApi.retrieveWageSetting(teamMemberId);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Update Wage Setting

Creates or updates a `WageSetting` object. The object is created if a
`WageSetting` with the specified `team_member_id` doesn't exist. Otherwise,
it fully replaces the `WageSetting` object for the team member.
The `WageSetting` is returned on a successful update. For more information, see
[Troubleshooting the Team API](https://developer.squareup.com/docs/team/troubleshooting#create-or-update-a-wage-setting).

Square recommends using [CreateTeamMember](../../doc/api/team.md#create-team-member) or [UpdateTeamMember](../../doc/api/team.md#update-team-member)
to manage the `TeamMember.wage_setting` field directly.

```ts
async updateWageSetting(
  teamMemberId: string,
  body: UpdateWageSettingRequest,
  requestOptions?: RequestOptions
): Promise<ApiResponse<UpdateWageSettingResponse>>
```
