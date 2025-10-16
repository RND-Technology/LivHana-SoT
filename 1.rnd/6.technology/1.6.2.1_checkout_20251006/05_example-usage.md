## Example Usage

```ts
const locationId = 'location_id4';

const body: CreateCheckoutRequest = {
  idempotencyKey: '86ae1696-b1e3-4328-af6d-f1e04d947ad6',
  order: {
    order: {
      locationId: 'location_id',
      referenceId: 'reference_id',
      customerId: 'customer_id',
      lineItems: [
        {
          quantity: '2',
          name: 'Printed T Shirt',
          appliedTaxes: [
            {
              taxUid: '38ze1696-z1e3-5628-af6d-f1e04d947fg3',
            }
          ],
          appliedDiscounts: [
            {
              discountUid: '56ae1696-z1e3-9328-af6d-f1e04d947gd4',
            }
          ],
          basePriceMoney: {
            amount: BigInt(1500),
            currency: 'USD',
          },
        },
        {
          quantity: '1',
          name: 'Slim Jeans',
          basePriceMoney: {
            amount: BigInt(2500),
            currency: 'USD',
          },
        },
        {
          quantity: '3',
          name: 'Woven Sweater',
          basePriceMoney: {
            amount: BigInt(3500),
            currency: 'USD',
          },
        }
      ],
      taxes: [
        {
          uid: '38ze1696-z1e3-5628-af6d-f1e04d947fg3',
          type: 'INCLUSIVE',
          percentage: '7.75',
          scope: 'LINE_ITEM',
        }
      ],
      discounts: [
        {
          uid: '56ae1696-z1e3-9328-af6d-f1e04d947gd4',
          type: 'FIXED_AMOUNT',
          amountMoney: {
            amount: BigInt(100),
            currency: 'USD',
          },
          scope: 'LINE_ITEM',
        }
      ],
    },
    idempotencyKey: '12ae1696-z1e3-4328-af6d-f1e04d947gd4',
  },
  askForShippingAddress: true,
  merchantSupportEmail: 'merchant+support@website.com',
  prePopulateBuyerEmail: 'example@email.com',
  prePopulateShippingAddress: {
    addressLine1: '1455 Market St.',
    addressLine2: 'Suite 600',
    locality: 'San Francisco',
    administrativeDistrictLevel1: 'CA',
    postalCode: '94103',
    country: 'US',
    firstName: 'Jane',
    lastName: 'Doe',
  },
  redirectUrl: 'https://merchant.website.com/order-confirm',
  additionalRecipients: [
    {
      locationId: '057P5VYJ4A5X1',
      description: 'Application fees',
      amountMoney: {
        amount: BigInt(60),
        currency: 'USD',
      },
    }
  ],
};

try {
  const { result, ...httpResponse } = await checkoutApi.createCheckout(
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

# Retrieve Location Settings

Retrieves the location-level settings for a Square-hosted checkout page.

```ts
async retrieveLocationSettings(
  locationId: string,
  requestOptions?: RequestOptions
): Promise<ApiResponse<RetrieveLocationSettingsResponse>>
```
