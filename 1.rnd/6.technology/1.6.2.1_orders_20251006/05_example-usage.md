## Example Usage

```ts
const body: CreateOrderRequest = {
  order: {
    locationId: '057P5VYJ4A5X1',
    referenceId: 'my-order-001',
    lineItems: [
      {
        quantity: '1',
        name: 'New York Strip Steak',
        basePriceMoney: {
          amount: BigInt(1599),
          currency: 'USD',
        },
      },
      {
        quantity: '2',
        catalogObjectId: 'BEMYCSMIJL46OCDV4KYIKXIB',
        modifiers: [
          {
            catalogObjectId: 'CHQX7Y4KY6N5KINJKZCFURPZ',
          }
        ],
        appliedDiscounts: [
          {
            discountUid: 'one-dollar-off',
          }
        ],
      }
    ],
    taxes: [
      {
        uid: 'state-sales-tax',
        name: 'State Sales Tax',
        percentage: '9',
        scope: 'ORDER',
      }
    ],
    discounts: [
      {
        uid: 'labor-day-sale',
        name: 'Labor Day Sale',
        percentage: '5',
        scope: 'ORDER',
      },
      {
        uid: 'membership-discount',
        catalogObjectId: 'DB7L55ZH2BGWI4H23ULIWOQ7',
        scope: 'ORDER',
      },
      {
        uid: 'one-dollar-off',
        name: 'Sale - $1.00 off',
        amountMoney: {
          amount: BigInt(100),
          currency: 'USD',
        },
        scope: 'LINE_ITEM',
      }
    ],
  },
  idempotencyKey: '8193148c-9586-11e6-99f9-28cfe92138cf',
};

try {
  const { result, ...httpResponse } = await ordersApi.createOrder(body);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Batch Retrieve Orders

Retrieves a set of [orders](../../doc/models/order.md) by their IDs.

If a given order ID does not exist, the ID is ignored instead of generating an error.

```ts
async batchRetrieveOrders(
  body: BatchRetrieveOrdersRequest,
  requestOptions?: RequestOptions
): Promise<ApiResponse<BatchRetrieveOrdersResponse>>
```
