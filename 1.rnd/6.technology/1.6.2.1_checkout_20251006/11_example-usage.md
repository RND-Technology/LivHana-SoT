## Example Usage

```ts
const locationId = 'location_id4';

const body: UpdateLocationSettingsRequest = {
  locationSettings: {
  },
};

try {
  const { result, ...httpResponse } = await checkoutApi.updateLocationSettings(
  locationId,
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

# Retrieve Merchant Settings

Retrieves the merchant-level settings for a Square-hosted checkout page.

```ts
async retrieveMerchantSettings(
  requestOptions?: RequestOptions
): Promise<ApiResponse<RetrieveMerchantSettingsResponse>>
```
