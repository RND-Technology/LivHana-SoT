## Example Usage

```ts
const body: UpdateItemTaxesRequest = {
  itemIds: [
    'H42BRLUJ5KTZTTMPVSLFAACQ',
    '2JXOBJIHCWBQ4NZ3RIXQGJA6'
  ],
  taxesToEnable: [
    '4WRCNHCJZDVLSNDQ35PP6YAD'
  ],
  taxesToDisable: [
    'AQCEGCEBBQONINDOHRGZISEX'
  ],
};

try {
  const { result, ...httpResponse } = await catalogApi.updateItemTaxes(body);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```
