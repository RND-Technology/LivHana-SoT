## Example Usage

```ts
const body: CalculateOrderRequest = {
  order: {
    locationId: 'D7AVYMEAPJ3A3',
    lineItems: [
      {
        quantity: '1',
        name: 'Item 1',
        basePriceMoney: {
          amount: BigInt(500),
          currency: 'USD',
        },
      },
      {
        quantity: '2',
        name: 'Item 2',
        basePriceMoney: {
          amount: BigInt(300),
          currency: 'USD',
        },
      }
    ],
    discounts: [
      {
        name: '50% Off',
        percentage: '50',
        scope: 'ORDER',
      }
    ],
  },
};

try {
  const { result, ...httpResponse } = await ordersApi.calculateOrder(body);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Clone Order

Creates a new order, in the `DRAFT` state, by duplicating an existing order. The newly created order has
only the core fields (such as line items, taxes, and discounts) copied from the original order.

```ts
async cloneOrder(
  body: CloneOrderRequest,
  requestOptions?: RequestOptions
): Promise<ApiResponse<CloneOrderResponse>>
```
