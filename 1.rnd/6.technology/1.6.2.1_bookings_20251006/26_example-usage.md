## Example Usage

```ts
const bookableOnly = false;

try {
  const { result, ...httpResponse } = await bookingsApi.listTeamMemberBookingProfiles(bookableOnly);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Bulk Retrieve Team Member Booking Profiles

Retrieves one or more team members' booking profiles.

```ts
async bulkRetrieveTeamMemberBookingProfiles(
  body: BulkRetrieveTeamMemberBookingProfilesRequest,
  requestOptions?: RequestOptions
): Promise<ApiResponse<BulkRetrieveTeamMemberBookingProfilesResponse>>
```
