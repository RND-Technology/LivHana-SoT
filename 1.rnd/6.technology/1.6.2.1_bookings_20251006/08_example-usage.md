## Example Usage

```ts
const body: CreateBookingRequest = {
  booking: {
  },
};

try {
  const { result, ...httpResponse } = await bookingsApi.createBooking(body);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Search Availability

Searches for availabilities for booking.

To call this endpoint with buyer-level permissions, set `APPOINTMENTS_READ` for the OAuth scope.
To call this endpoint with seller-level permissions, set `APPOINTMENTS_ALL_READ` and `APPOINTMENTS_READ` for the OAuth scope.

```ts
async searchAvailability(
  body: SearchAvailabilityRequest,
  requestOptions?: RequestOptions
): Promise<ApiResponse<SearchAvailabilityResponse>>
```
