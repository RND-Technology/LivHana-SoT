## Example Usage

```ts
try {
  const { result, ...httpResponse } = await bookingCustomAttributesApi.listBookingCustomAttributeDefinitions();
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Create Booking Custom Attribute Definition

Creates a bookings custom attribute definition.

To call this endpoint with buyer-level permissions, set `APPOINTMENTS_WRITE` for the OAuth scope.
To call this endpoint with seller-level permissions, set `APPOINTMENTS_ALL_WRITE` and `APPOINTMENTS_WRITE` for the OAuth scope.

For calls to this endpoint with seller-level permissions to succeed, the seller must have subscribed to *Appointments Plus*
or *Appointments Premium*.

```ts
async createBookingCustomAttributeDefinition(
  body: CreateBookingCustomAttributeDefinitionRequest,
  requestOptions?: RequestOptions
): Promise<ApiResponse<CreateBookingCustomAttributeDefinitionResponse>>
```
