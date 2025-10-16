## Example Usage

```ts
const id = 'id0';

try {
  const { result, ...httpResponse } = await checkoutApi.retrievePaymentLink(id);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Update Payment Link

Updates a payment link. You can update the `payment_link` fields such as
`description`, `checkout_options`, and  `pre_populated_data`.
You cannot update other fields such as the `order_id`, `version`, `URL`, or `timestamp` field.

```ts
async updatePaymentLink(
  id: string,
  body: UpdatePaymentLinkRequest,
  requestOptions?: RequestOptions
): Promise<ApiResponse<UpdatePaymentLinkResponse>>
```
