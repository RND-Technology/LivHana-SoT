## Example Usage

```ts
try {
  const { result, ...httpResponse } = await bookingsApi.listBookings();
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Create Booking

Creates a booking.

The required input must include the following:

* `Booking.location_id`
* `Booking.start_at`
* `Booking.AppointmentSegment.team_member_id`
* `Booking.AppointmentSegment.service_variation_id`
* `Booking.AppointmentSegment.service_variation_version`

To call this endpoint with buyer-level permissions, set `APPOINTMENTS_WRITE` for the OAuth scope.
To call this endpoint with seller-level permissions, set `APPOINTMENTS_ALL_WRITE` and `APPOINTMENTS_WRITE` for the OAuth scope.

For calls to this endpoint with seller-level permissions to succeed, the seller must have subscribed to *Appointments Plus*
or *Appointments Premium*.

```ts
async createBooking(
  body: CreateBookingRequest,
  requestOptions?: RequestOptions
): Promise<ApiResponse<CreateBookingResponse>>
```
