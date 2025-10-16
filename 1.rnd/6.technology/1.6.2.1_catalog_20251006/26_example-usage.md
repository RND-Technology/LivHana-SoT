## Example Usage

```ts
const body: UpsertCatalogObjectRequest = {
  idempotencyKey: 'af3d1afc-7212-4300-b463-0bfc5314a5ae',
  object: {
    type: 'ITEM',
    id: '#Cocoa',
    itemData: {
      name: 'Cocoa',
      abbreviation: 'Ch',
      variations: [
        {
          type: 'ITEM_VARIATION',
          id: '#Small',
          itemVariationData: {
            itemId: '#Cocoa',
            name: 'Small',
            pricingType: 'VARIABLE_PRICING',
          },
        },
        {
          type: 'ITEM_VARIATION',
          id: '#Large',
          itemVariationData: {
            itemId: '#Cocoa',
            name: 'Large',
            pricingType: 'FIXED_PRICING',
            priceMoney: {
              amount: BigInt(400),
              currency: 'USD',
            },
          },
        }
      ],
      descriptionHtml: '<p><strong>Hot</strong> Chocolate</p>',
    },
  },
};

try {
  const { result, ...httpResponse } = await catalogApi.upsertCatalogObject(body);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Delete Catalog Object

Deletes a single [CatalogObject](../../doc/models/catalog-object.md) based on the
provided ID and returns the set of successfully deleted IDs in the response.
Deletion is a cascading event such that all children of the targeted object
are also deleted. For example, deleting a [CatalogItem](../../doc/models/catalog-item.md)
will also delete all of its
[CatalogItemVariation](../../doc/models/catalog-item-variation.md) children.

To ensure consistency, only one delete request is processed at a time per seller account.
While one (batch or non-batch) delete request is being processed, other (batched and non-batched)
delete requests are rejected with the `429` error code.

```ts
async deleteCatalogObject(
  objectId: string,
  requestOptions?: RequestOptions
): Promise<ApiResponse<DeleteCatalogObjectResponse>>
```
