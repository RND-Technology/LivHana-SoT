## Example Usage

```ts
try {
  const { result, ...httpResponse } = await bookingsApi.listLocationBookingProfiles();
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Retrieve Location Booking Profile

Retrieves a seller's location booking profile.

```ts
async retrieveLocationBookingProfile(
  locationId: string,
  requestOptions?: RequestOptions
): Promise<ApiResponse<RetrieveLocationBookingProfileResponse>>
```
