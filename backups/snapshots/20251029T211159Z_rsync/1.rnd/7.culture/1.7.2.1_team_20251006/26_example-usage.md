## Example Usage

```ts
const body: SearchTeamMembersRequest = {
  query: {
    filter: {
      locationIds: [
        '0G5P3VGACMMQZ'
      ],
      status: 'ACTIVE',
    },
  },
  limit: 10,
};

try {
  const { result, ...httpResponse } = await teamApi.searchTeamMembers(body);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Retrieve Team Member

Retrieves a `TeamMember` object for the given `TeamMember.id`.
Learn about [Troubleshooting the Team API](https://developer.squareup.com/docs/team/troubleshooting#retrieve-a-team-member).

```ts
async retrieveTeamMember(
  teamMemberId: string,
  requestOptions?: RequestOptions
): Promise<ApiResponse<RetrieveTeamMemberResponse>>
```
