## Example Usage

```ts
try {
  const { result, ...httpResponse } = await checkoutApi.retrieveMerchantSettings();
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Update Merchant Settings

Updates the merchant-level settings for a Square-hosted checkout page.

```ts
async updateMerchantSettings(
  body: UpdateMerchantSettingsRequest,
  requestOptions?: RequestOptions
): Promise<ApiResponse<UpdateMerchantSettingsResponse>>
```
