## Example Usage

```ts
const body: BulkRetrieveTeamMemberBookingProfilesRequest = {
  teamMemberIds: [
    'team_member_ids3',
    'team_member_ids4',
    'team_member_ids5'
  ],
};

try {
  const { result, ...httpResponse } = await bookingsApi.bulkRetrieveTeamMemberBookingProfiles(body);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Retrieve Team Member Booking Profile

Retrieves a team member's booking profile.

```ts
async retrieveTeamMemberBookingProfile(
  teamMemberId: string,
  requestOptions?: RequestOptions
): Promise<ApiResponse<RetrieveTeamMemberBookingProfileResponse>>
```
