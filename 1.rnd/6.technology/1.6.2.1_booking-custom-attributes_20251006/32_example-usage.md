## Example Usage

```ts
const bookingId = 'booking_id4';

const key = 'key0';

const withDefinition = false;

try {
  const { result, ...httpResponse } = await bookingCustomAttributesApi.retrieveBookingCustomAttribute(
  bookingId,
  key,
  withDefinition
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

# Upsert Booking Custom Attribute

Upserts a bookings custom attribute.

To call this endpoint with buyer-level permissions, set `APPOINTMENTS_WRITE` for the OAuth scope.
To call this endpoint with seller-level permissions, set `APPOINTMENTS_ALL_WRITE` and `APPOINTMENTS_WRITE` for the OAuth scope.

For calls to this endpoint with seller-level permissions to succeed, the seller must have subscribed to *Appointments Plus*
or *Appointments Premium*.

```ts
async upsertBookingCustomAttribute(
  bookingId: string,
  key: string,
  body: UpsertBookingCustomAttributeRequest,
  requestOptions?: RequestOptions
): Promise<ApiResponse<UpsertBookingCustomAttributeResponse>>
```
