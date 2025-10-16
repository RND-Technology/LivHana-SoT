## Example Usage

```ts
const subscriptionId = 'subscription_id0';

const body: SwapPlanRequest = {
  newPlanVariationId: 'FQ7CDXXWSLUJRPM3GFJSJGZ7',
  phases: [
    {
      ordinal: BigInt(0),
      orderTemplateId: 'uhhnjH9osVv3shUADwaC0b3hNxQZY',
    }
  ],
};

try {
  const { result, ...httpResponse } = await subscriptionsApi.swapPlan(
  subscriptionId,
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
