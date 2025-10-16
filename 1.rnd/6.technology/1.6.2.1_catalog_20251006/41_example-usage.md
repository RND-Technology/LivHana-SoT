## Example Usage

```ts
const body: UpdateItemModifierListsRequest = {
  itemIds: [
    'H42BRLUJ5KTZTTMPVSLFAACQ',
    '2JXOBJIHCWBQ4NZ3RIXQGJA6'
  ],
  modifierListsToEnable: [
    'H42BRLUJ5KTZTTMPVSLFAACQ',
    '2JXOBJIHCWBQ4NZ3RIXQGJA6'
  ],
  modifierListsToDisable: [
    '7WRC16CJZDVLSNDQ35PP6YAD'
  ],
};

try {
  const { result, ...httpResponse } = await catalogApi.updateItemModifierLists(body);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Update Item Taxes

Updates the [CatalogTax](../../doc/models/catalog-tax.md) objects that apply to the
targeted [CatalogItem](../../doc/models/catalog-item.md) without having to perform an
upsert on the entire item.

```ts
async updateItemTaxes(
  body: UpdateItemTaxesRequest,
  requestOptions?: RequestOptions
): Promise<ApiResponse<UpdateItemTaxesResponse>>
```
