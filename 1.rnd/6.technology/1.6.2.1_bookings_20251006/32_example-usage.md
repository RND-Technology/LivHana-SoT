## Example Usage

```ts
const teamMemberId = 'team_member_id0';

try {
  const { result, ...httpResponse } = await bookingsApi.retrieveTeamMemberBookingProfile(teamMemberId);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Retrieve Booking

Retrieves a booking.

To call this endpoint with buyer-level permissions, set `APPOINTMENTS_READ` for the OAuth scope.
To call this endpoint with seller-level permissions, set `APPOINTMENTS_ALL_READ` and `APPOINTMENTS_READ` for the OAuth scope.

```ts
async retrieveBooking(
  bookingId: string,
  requestOptions?: RequestOptions
): Promise<ApiResponse<RetrieveBookingResponse>>
```
