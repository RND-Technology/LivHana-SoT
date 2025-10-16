## Example Usage

```ts
const bookingId = 'booking_id4';

const key = 'key0';

try {
  const { result, ...httpResponse } = await bookingCustomAttributesApi.deleteBookingCustomAttribute(
  bookingId,
  key
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

# Retrieve Booking Custom Attribute

Retrieves a bookings custom attribute.

To call this endpoint with buyer-level permissions, set `APPOINTMENTS_READ` for the OAuth scope.
To call this endpoint with seller-level permissions, set `APPOINTMENTS_ALL_READ` and `APPOINTMENTS_READ` for the OAuth scope.

```ts
async retrieveBookingCustomAttribute(
  bookingId: string,
  key: string,
  withDefinition?: boolean,
  version?: number,
  requestOptions?: RequestOptions
): Promise<ApiResponse<RetrieveBookingCustomAttributeResponse>>
```
