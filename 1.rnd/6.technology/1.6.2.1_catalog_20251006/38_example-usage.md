## Example Usage

```ts
const body: SearchCatalogItemsRequest = {
  textFilter: 'red',
  categoryIds: [
    'WINE_CATEGORY_ID'
  ],
  stockLevels: [
    'OUT',
    'LOW'
  ],
  enabledLocationIds: [
    'ATL_LOCATION_ID'
  ],
  limit: 100,
  sortOrder: 'ASC',
  productTypes: [
    'REGULAR'
  ],
  customAttributeFilters: [
    {
      customAttributeDefinitionId: 'VEGAN_DEFINITION_ID',
      boolFilter: true,
    },
    {
      customAttributeDefinitionId: 'BRAND_DEFINITION_ID',
      stringFilter: 'Dark Horse',
    },
    {
      key: 'VINTAGE',
      numberFilter: {
        min: '2017',
        max: '2018',
      },
    },
    {
      customAttributeDefinitionId: 'VARIETAL_DEFINITION_ID',
    }
  ],
};

try {
  const { result, ...httpResponse } = await catalogApi.searchCatalogItems(body);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Update Item Modifier Lists

Updates the [CatalogModifierList](../../doc/models/catalog-modifier-list.md) objects
that apply to the targeted [CatalogItem](../../doc/models/catalog-item.md) without having
to perform an upsert on the entire item.

```ts
async updateItemModifierLists(
  body: UpdateItemModifierListsRequest,
  requestOptions?: RequestOptions
): Promise<ApiResponse<UpdateItemModifierListsResponse>>
```
