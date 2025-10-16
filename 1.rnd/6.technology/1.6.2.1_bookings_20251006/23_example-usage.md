## Example Usage

```ts
const locationId = 'location_id4';

try {
  const { result, ...httpResponse } = await bookingsApi.retrieveLocationBookingProfile(locationId);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# List Team Member Booking Profiles

Lists booking profiles for team members.

```ts
async listTeamMemberBookingProfiles(
  bookableOnly?: boolean,
  limit?: number,
  cursor?: string,
  locationId?: string,
  requestOptions?: RequestOptions
): Promise<ApiResponse<ListTeamMemberBookingProfilesResponse>>
```
