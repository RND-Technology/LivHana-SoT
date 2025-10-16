## Methods

* [Create Checkout](../../doc/api/checkout.md#create-checkout)
* [Retrieve Location Settings](../../doc/api/checkout.md#retrieve-location-settings)
* [Update Location Settings](../../doc/api/checkout.md#update-location-settings)
* [Retrieve Merchant Settings](../../doc/api/checkout.md#retrieve-merchant-settings)
* [Update Merchant Settings](../../doc/api/checkout.md#update-merchant-settings)
* [List Payment Links](../../doc/api/checkout.md#list-payment-links)
* [Create Payment Link](../../doc/api/checkout.md#create-payment-link)
* [Delete Payment Link](../../doc/api/checkout.md#delete-payment-link)
* [Retrieve Payment Link](../../doc/api/checkout.md#retrieve-payment-link)
* [Update Payment Link](../../doc/api/checkout.md#update-payment-link)

# Create Checkout

**This endpoint is deprecated.**

Links a `checkoutId` to a `checkout_page_url` that customers are
directed to in order to provide their payment information using a
payment processing workflow hosted on connect.squareup.com.

NOTE: The Checkout API has been updated with new features.
For more information, see [Checkout API highlights](https://developer.squareup.com/docs/checkout-api#checkout-api-highlights).

```ts
async createCheckout(
  locationId: string,
  body: CreateCheckoutRequest,
  requestOptions?: RequestOptions
): Promise<ApiResponse<CreateCheckoutResponse>>
```
