## Example Usage

```ts
const body: BatchRetrieveOrdersRequest = {
  orderIds: [
    'CAISEM82RcpmcFBM0TfOyiHV3es',
    'CAISENgvlJ6jLWAzERDzjyHVybY'
  ],
  locationId: '057P5VYJ4A5X1',
};

try {
  const { result, ...httpResponse } = await ordersApi.batchRetrieveOrders(body);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Calculate Order

Enables applications to preview order pricing without creating an order.

```ts
async calculateOrder(
  body: CalculateOrderRequest,
  requestOptions?: RequestOptions
): Promise<ApiResponse<CalculateOrderResponse>>
```
