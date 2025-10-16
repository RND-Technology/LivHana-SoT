## Example Usage

```ts
const body: BulkRetrieveBookingsRequest = {
  bookingIds: [
    'booking_ids8',
    'booking_ids9',
    'booking_ids0'
  ],
};

try {
  const { result, ...httpResponse } = await bookingsApi.bulkRetrieveBookings(body);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Retrieve Business Booking Profile

Retrieves a seller's booking profile.

```ts
async retrieveBusinessBookingProfile(
  requestOptions?: RequestOptions
): Promise<ApiResponse<RetrieveBusinessBookingProfileResponse>>
```
