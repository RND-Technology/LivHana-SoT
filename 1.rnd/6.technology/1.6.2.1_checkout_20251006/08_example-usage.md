## Example Usage

```ts
const locationId = 'location_id4';

try {
  const { result, ...httpResponse } = await checkoutApi.retrieveLocationSettings(locationId);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Update Location Settings

Updates the location-level settings for a Square-hosted checkout page.

```ts
async updateLocationSettings(
  locationId: string,
  body: UpdateLocationSettingsRequest,
  requestOptions?: RequestOptions
): Promise<ApiResponse<UpdateLocationSettingsResponse>>
```
