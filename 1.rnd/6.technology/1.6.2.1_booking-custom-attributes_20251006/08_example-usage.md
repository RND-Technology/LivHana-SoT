## Example Usage

```ts
const body: CreateBookingCustomAttributeDefinitionRequest = {
  customAttributeDefinition: {
  },
};

try {
  const { result, ...httpResponse } = await bookingCustomAttributesApi.createBookingCustomAttributeDefinition(body);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Delete Booking Custom Attribute Definition

Deletes a bookings custom attribute definition.

To call this endpoint with buyer-level permissions, set `APPOINTMENTS_WRITE` for the OAuth scope.
To call this endpoint with seller-level permissions, set `APPOINTMENTS_ALL_WRITE` and `APPOINTMENTS_WRITE` for the OAuth scope.

For calls to this endpoint with seller-level permissions to succeed, the seller must have subscribed to *Appointments Plus*
or *Appointments Premium*.

```ts
async deleteBookingCustomAttributeDefinition(
  key: string,
  requestOptions?: RequestOptions
): Promise<ApiResponse<DeleteBookingCustomAttributeDefinitionResponse>>
```
