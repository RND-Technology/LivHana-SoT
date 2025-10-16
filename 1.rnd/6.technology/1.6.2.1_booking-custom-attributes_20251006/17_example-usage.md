## Example Usage

```ts
const key = 'key0';

const body: UpdateBookingCustomAttributeDefinitionRequest = {
  customAttributeDefinition: {
  },
};

try {
  const { result, ...httpResponse } = await bookingCustomAttributesApi.updateBookingCustomAttributeDefinition(
  key,
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

# Bulk Delete Booking Custom Attributes

Bulk deletes bookings custom attributes.

To call this endpoint with buyer-level permissions, set `APPOINTMENTS_WRITE` for the OAuth scope.
To call this endpoint with seller-level permissions, set `APPOINTMENTS_ALL_WRITE` and `APPOINTMENTS_WRITE` for the OAuth scope.

For calls to this endpoint with seller-level permissions to succeed, the seller must have subscribed to *Appointments Plus*
or *Appointments Premium*.

```ts
async bulkDeleteBookingCustomAttributes(
  body: BulkDeleteBookingCustomAttributesRequest,
  requestOptions?: RequestOptions
): Promise<ApiResponse<BulkDeleteBookingCustomAttributesResponse>>
```
