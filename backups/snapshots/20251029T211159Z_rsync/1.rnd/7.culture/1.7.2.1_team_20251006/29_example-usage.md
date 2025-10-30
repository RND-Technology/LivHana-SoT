## Example Usage

```ts
const teamMemberId = 'team_member_id0';

try {
  const { result, ...httpResponse } = await teamApi.retrieveTeamMember(teamMemberId);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Update Team Member

Updates a single `TeamMember` object. The `TeamMember` object is returned on successful updates.
Learn about [Troubleshooting the Team API](https://developer.squareup.com/docs/team/troubleshooting#update-a-team-member).

```ts
async updateTeamMember(
  teamMemberId: string,
  body: UpdateTeamMemberRequest,
  requestOptions?: RequestOptions
): Promise<ApiResponse<UpdateTeamMemberResponse>>
```
