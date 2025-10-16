## Example Usage

```ts
const body: SearchOrdersRequest = {
  locationIds: [
    '057P5VYJ4A5X1',
    '18YC4JDH91E1H'
  ],
  query: {
    filter: {
      stateFilter: {
        states: [
          'COMPLETED'
        ],
      },
      dateTimeFilter: {
        closedAt: {
          startAt: '2018-03-03T20:00:00+00:00',
          endAt: '2019-03-04T21:54:45+00:00',
        },
      },
    },
    sort: {
      sortField: 'CLOSED_AT',
      sortOrder: 'DESC',
    },
  },
  limit: 3,
  returnEntries: true,
};

try {
  const { result, ...httpResponse } = await ordersApi.searchOrders(body);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Retrieve Order

Retrieves an [Order](../../doc/models/order.md) by ID.

```ts
async retrieveOrder(
  orderId: string,
  requestOptions?: RequestOptions
): Promise<ApiResponse<RetrieveOrderResponse>>
```
