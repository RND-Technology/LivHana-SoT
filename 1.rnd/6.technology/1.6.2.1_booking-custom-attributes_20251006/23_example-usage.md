## Example Usage

```ts
const body: BulkUpsertBookingCustomAttributesRequest = {
  values: {
    'key0': {
      bookingId: 'booking_id4',
      customAttribute: {
      },
    },
    'key1': {
      bookingId: 'booking_id4',
      customAttribute: {
      },
    }
  },
};

try {
  const { result, ...httpResponse } = await bookingCustomAttributesApi.bulkUpsertBookingCustomAttributes(body);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# List Booking Custom Attributes

Lists a booking's custom attributes.

To call this endpoint with buyer-level permissions, set `APPOINTMENTS_READ` for the OAuth scope.
To call this endpoint with seller-level permissions, set `APPOINTMENTS_ALL_READ` and `APPOINTMENTS_READ` for the OAuth scope.

```ts
async listBookingCustomAttributes(
  bookingId: string,
  limit?: number,
  cursor?: string,
  withDefinitions?: boolean,
  requestOptions?: RequestOptions
): Promise<ApiResponse<ListBookingCustomAttributesResponse>>
```
