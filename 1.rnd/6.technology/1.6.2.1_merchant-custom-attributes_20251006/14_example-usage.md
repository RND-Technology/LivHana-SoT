## Example Usage

```ts
const key = 'key0';

try {
  const { result, ...httpResponse } = await merchantCustomAttributesApi.retrieveMerchantCustomAttributeDefinition(key);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Update Merchant Custom Attribute Definition

Updates a merchant-related [custom attribute definition](../../doc/models/custom-attribute-definition.md) for a Square seller account.
Use this endpoint to update the following fields: `name`, `description`, `visibility`, or the
`schema` for a `Selection` data type.
Only the definition owner can update a custom attribute definition.

```ts
async updateMerchantCustomAttributeDefinition(
  key: string,
  body: UpdateMerchantCustomAttributeDefinitionRequest,
  requestOptions?: RequestOptions
): Promise<ApiResponse<UpdateMerchantCustomAttributeDefinitionResponse>>
```
