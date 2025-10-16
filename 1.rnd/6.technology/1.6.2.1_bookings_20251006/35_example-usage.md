## Example Usage

```ts
const bookingId = 'booking_id4';

try {
  const { result, ...httpResponse } = await bookingsApi.retrieveBooking(bookingId);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Update Booking

Updates a booking.

To call this endpoint with buyer-level permissions, set `APPOINTMENTS_WRITE` for the OAuth scope.
To call this endpoint with seller-level permissions, set `APPOINTMENTS_ALL_WRITE` and `APPOINTMENTS_WRITE` for the OAuth scope.

For calls to this endpoint with seller-level permissions to succeed, the seller must have subscribed to *Appointments Plus*
or *Appointments Premium*.

```ts
async updateBooking(
  bookingId: string,
  body: UpdateBookingRequest,
  requestOptions?: RequestOptions
): Promise<ApiResponse<UpdateBookingResponse>>
```
