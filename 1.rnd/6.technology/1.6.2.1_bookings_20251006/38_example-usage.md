## Example Usage

```ts
const bookingId = 'booking_id4';

const body: UpdateBookingRequest = {
  booking: {
  },
};

try {
  const { result, ...httpResponse } = await bookingsApi.updateBooking(
  bookingId,
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

# Cancel Booking

Cancels an existing booking.

To call this endpoint with buyer-level permissions, set `APPOINTMENTS_WRITE` for the OAuth scope.
To call this endpoint with seller-level permissions, set `APPOINTMENTS_ALL_WRITE` and `APPOINTMENTS_WRITE` for the OAuth scope.

For calls to this endpoint with seller-level permissions to succeed, the seller must have subscribed to *Appointments Plus*
or *Appointments Premium*.

```ts
async cancelBooking(
  bookingId: string,
  body: CancelBookingRequest,
  requestOptions?: RequestOptions
): Promise<ApiResponse<CancelBookingResponse>>
```
