## Example Usage

```ts
const bookingId = 'booking_id4';

const body: CancelBookingRequest = {
};

try {
  const { result, ...httpResponse } = await bookingsApi.cancelBooking(
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
