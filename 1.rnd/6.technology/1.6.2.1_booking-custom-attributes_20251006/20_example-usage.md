## Example Usage

```ts
const body: BulkDeleteBookingCustomAttributesRequest = {
  values: {
    'key0': {
      bookingId: 'booking_id4',
      key: 'key0',
    },
    'key1': {
      bookingId: 'booking_id4',
      key: 'key0',
    }
  },
};

try {
  const { result, ...httpResponse } = await bookingCustomAttributesApi.bulkDeleteBookingCustomAttributes(body);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Bulk Upsert Booking Custom Attributes

Bulk upserts bookings custom attributes.

To call this endpoint with buyer-level permissions, set `APPOINTMENTS_WRITE` for the OAuth scope.
To call this endpoint with seller-level permissions, set `APPOINTMENTS_ALL_WRITE` and `APPOINTMENTS_WRITE` for the OAuth scope.

For calls to this endpoint with seller-level permissions to succeed, the seller must have subscribed to *Appointments Plus*
or *Appointments Premium*.

```ts
async bulkUpsertBookingCustomAttributes(
  body: BulkUpsertBookingCustomAttributesRequest,
  requestOptions?: RequestOptions
): Promise<ApiResponse<BulkUpsertBookingCustomAttributesResponse>>
```
