## Example Usage

```ts
const bookingId = 'booking_id4';

const key = 'key0';

const body: UpsertBookingCustomAttributeRequest = {
  customAttribute: {
  },
};

try {
  const { result, ...httpResponse } = await bookingCustomAttributesApi.upsertBookingCustomAttribute(
  bookingId,
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
