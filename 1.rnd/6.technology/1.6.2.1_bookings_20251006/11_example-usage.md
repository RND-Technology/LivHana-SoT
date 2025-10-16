## Example Usage

```ts
const body: SearchAvailabilityRequest = {
  query: {
    filter: {
      startAtRange: {
      },
    },
  },
};

try {
  const { result, ...httpResponse } = await bookingsApi.searchAvailability(body);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Bulk Retrieve Bookings

Bulk-Retrieves a list of bookings by booking IDs.

To call this endpoint with buyer-level permissions, set `APPOINTMENTS_READ` for the OAuth scope.
To call this endpoint with seller-level permissions, set `APPOINTMENTS_ALL_READ` and `APPOINTMENTS_READ` for the OAuth scope.

```ts
async bulkRetrieveBookings(
  body: BulkRetrieveBookingsRequest,
  requestOptions?: RequestOptions
): Promise<ApiResponse<BulkRetrieveBookingsResponse>>
```
