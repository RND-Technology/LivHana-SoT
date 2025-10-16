## Example Usage

```ts
try {
  const { result, ...httpResponse } = await bookingsApi.retrieveBusinessBookingProfile();
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# List Location Booking Profiles

Lists location booking profiles of a seller.

```ts
async listLocationBookingProfiles(
  limit?: number,
  cursor?: string,
  requestOptions?: RequestOptions
): Promise<ApiResponse<ListLocationBookingProfilesResponse>>
```
