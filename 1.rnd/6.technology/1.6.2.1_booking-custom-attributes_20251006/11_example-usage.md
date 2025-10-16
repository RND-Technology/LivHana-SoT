## Example Usage

```ts
const key = 'key0';

try {
  const { result, ...httpResponse } = await bookingCustomAttributesApi.deleteBookingCustomAttributeDefinition(key);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Retrieve Booking Custom Attribute Definition

Retrieves a bookings custom attribute definition.

To call this endpoint with buyer-level permissions, set `APPOINTMENTS_READ` for the OAuth scope.
To call this endpoint with seller-level permissions, set `APPOINTMENTS_ALL_READ` and `APPOINTMENTS_READ` for the OAuth scope.

```ts
async retrieveBookingCustomAttributeDefinition(
  key: string,
  version?: number,
  requestOptions?: RequestOptions
): Promise<ApiResponse<RetrieveBookingCustomAttributeDefinitionResponse>>
```
