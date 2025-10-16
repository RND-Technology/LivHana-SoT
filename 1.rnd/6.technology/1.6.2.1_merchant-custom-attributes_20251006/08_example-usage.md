## Example Usage

```ts
const body: CreateMerchantCustomAttributeDefinitionRequest = {
  customAttributeDefinition: {
    key: 'alternative_seller_name',
    name: 'Alternative Merchant Name',
    description: 'This is the other name this merchant goes by.',
    visibility: 'VISIBILITY_READ_ONLY',
  },
};

try {
  const { result, ...httpResponse } = await merchantCustomAttributesApi.createMerchantCustomAttributeDefinition(body);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Delete Merchant Custom Attribute Definition

Deletes a merchant-related [custom attribute definition](../../doc/models/custom-attribute-definition.md) from a Square seller account.
Deleting a custom attribute definition also deletes the corresponding custom attribute from
the merchant.
Only the definition owner can delete a custom attribute definition.

```ts
async deleteMerchantCustomAttributeDefinition(
  key: string,
  requestOptions?: RequestOptions
): Promise<ApiResponse<DeleteMerchantCustomAttributeDefinitionResponse>>
```
