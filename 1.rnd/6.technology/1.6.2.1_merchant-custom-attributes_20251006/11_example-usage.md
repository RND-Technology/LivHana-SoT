## Example Usage

```ts
const key = 'key0';

try {
  const { result, ...httpResponse } = await merchantCustomAttributesApi.deleteMerchantCustomAttributeDefinition(key);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Retrieve Merchant Custom Attribute Definition

Retrieves a merchant-related [custom attribute definition](../../doc/models/custom-attribute-definition.md) from a Square seller account.
To retrieve a custom attribute definition created by another application, the `visibility`
setting must be `VISIBILITY_READ_ONLY` or `VISIBILITY_READ_WRITE_VALUES`.

```ts
async retrieveMerchantCustomAttributeDefinition(
  key: string,
  version?: number,
  requestOptions?: RequestOptions
): Promise<ApiResponse<RetrieveMerchantCustomAttributeDefinitionResponse>>
```
