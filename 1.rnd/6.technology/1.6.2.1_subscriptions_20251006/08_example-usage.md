## Example Usage

```ts
const body: BulkSwapPlanRequest = {
  newPlanVariationId: 'FQ7CDXXWSLUJRPM3GFJSJGZ7',
  oldPlanVariationId: '6JHXF3B2CW3YKHDV4XEM674H',
  locationId: 'S8GWD5R9QB376',
};

try {
  const { result, ...httpResponse } = await subscriptionsApi.bulkSwapPlan(body);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Search Subscriptions

Searches for subscriptions.

Results are ordered chronologically by subscription creation date. If
the request specifies more than one location ID,
the endpoint orders the result
by location ID, and then by creation date within each location. If no locations are given
in the query, all locations are searched.

You can also optionally specify `customer_ids` to search by customer.
If left unset, all customers
associated with the specified locations are returned.
If the request specifies customer IDs, the endpoint orders results
first by location, within location by customer ID, and within
customer by subscription creation date.

```ts
async searchSubscriptions(
  body: SearchSubscriptionsRequest,
  requestOptions?: RequestOptions
): Promise<ApiResponse<SearchSubscriptionsResponse>>
```
