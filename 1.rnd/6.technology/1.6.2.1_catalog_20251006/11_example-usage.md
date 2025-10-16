## Example Usage

```ts
const body: BatchUpsertCatalogObjectsRequest = {
  idempotencyKey: '789ff020-f723-43a9-b4b5-43b5dc1fa3dc',
  batches: [
    {
      objects: [
        {
          type: 'ITEM',
          id: '#Tea',
          presentAtAllLocations: true,
          itemData: {
            name: 'Tea',
            taxIds: [
              '#SalesTax'
            ],
            variations: [
              {
                type: 'ITEM_VARIATION',
                id: '#Tea_Mug',
                presentAtAllLocations: true,
                itemVariationData: {
                  itemId: '#Tea',
                  name: 'Mug',
                  pricingType: 'FIXED_PRICING',
                  priceMoney: {
                    amount: BigInt(150),
                    currency: 'USD',
                  },
                },
              }
            ],
            categories: [
              {
                id: '#Beverages',
              }
            ],
            descriptionHtml: '<p><strong>Hot</strong> Leaf Juice</p>',
          },
        },
        {
          type: 'ITEM',
          id: '#Coffee',
          presentAtAllLocations: true,
          itemData: {
            name: 'Coffee',
            taxIds: [
              '#SalesTax'
            ],
            variations: [
              {
                type: 'ITEM_VARIATION',
                id: '#Coffee_Regular',
                presentAtAllLocations: true,
                itemVariationData: {
                  itemId: '#Coffee',
                  name: 'Regular',
                  pricingType: 'FIXED_PRICING',
                  priceMoney: {
                    amount: BigInt(250),
                    currency: 'USD',
                  },
                },
              },
              {
                type: 'ITEM_VARIATION',
                id: '#Coffee_Large',
                presentAtAllLocations: true,
                itemVariationData: {
                  itemId: '#Coffee',
                  name: 'Large',
                  pricingType: 'FIXED_PRICING',
                  priceMoney: {
                    amount: BigInt(350),
                    currency: 'USD',
                  },
                },
              }
            ],
            categories: [
              {
                id: '#Beverages',
              }
            ],
            descriptionHtml: '<p>Hot <em>Bean Juice</em></p>',
          },
        },
        {
          type: 'CATEGORY',
          id: '#Beverages',
          presentAtAllLocations: true,
          categoryData: {
            name: 'Beverages',
          },
        },
        {
          type: 'TAX',
          id: '#SalesTax',
          presentAtAllLocations: true,
          taxData: {
            name: 'Sales Tax',
            calculationPhase: 'TAX_SUBTOTAL_PHASE',
            inclusionType: 'ADDITIVE',
            percentage: '5.0',
            appliesToCustomAmounts: true,
            enabled: true,
          },
        }
      ],
    }
  ],
};

try {
  const { result, ...httpResponse } = await catalogApi.batchUpsertCatalogObjects(body);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Create Catalog Image

Uploads an image file to be represented by a [CatalogImage](../../doc/models/catalog-image.md) object that can be linked to an existing
[CatalogObject](../../doc/models/catalog-object.md) instance. The resulting `CatalogImage` is unattached to any `CatalogObject` if the `object_id`
is not specified.

This `CreateCatalogImage` endpoint accepts HTTP multipart/form-data requests with a JSON part and an image file part in
JPEG, PJPEG, PNG, or GIF format. The maximum file size is 15MB.

```ts
async createCatalogImage(
  request?: CreateCatalogImageRequest,
  imageFile?: FileWrapper,
  requestOptions?: RequestOptions
): Promise<ApiResponse<CreateCatalogImageResponse>>
```
