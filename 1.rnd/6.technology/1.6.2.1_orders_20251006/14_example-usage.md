## Example Usage

```ts
const body: CloneOrderRequest = {
  orderId: 'ZAISEM52YcpmcWAzERDOyiWS123',
  version: 3,
  idempotencyKey: 'UNIQUE_STRING',
};

try {
  const { result, ...httpResponse } = await ordersApi.cloneOrder(body);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Search Orders

Search all orders for one or more locations. Orders include all sales,
returns, and exchanges regardless of how or when they entered the Square
ecosystem (such as Point of Sale, Invoices, and Connect APIs).

`SearchOrders` requests need to specify which locations to search and define a
[SearchOrdersQuery](../../doc/models/search-orders-query.md) object that controls
how to sort or filter the results. Your `SearchOrdersQuery` can:

Set filter criteria.
Set the sort order.
Determine whether to return results as complete `Order` objects or as
[OrderEntry](../../doc/models/order-entry.md) objects.

Note that details for orders processed with Square Point of Sale while in
offline mode might not be transmitted to Square for up to 72 hours. Offline
orders have a `created_at` value that reflects the time the order was created,
not the time it was subsequently transmitted to Square.

```ts
async searchOrders(
  body: SearchOrdersRequest,
  requestOptions?: RequestOptions
): Promise<ApiResponse<SearchOrdersResponse>>
```
