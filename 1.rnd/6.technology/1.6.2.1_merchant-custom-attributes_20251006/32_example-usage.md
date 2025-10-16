## Example Usage

```ts
const merchantId = 'merchant_id0';

const key = 'key0';

const withDefinition = false;

try {
  const { result, ...httpResponse } = await merchantCustomAttributesApi.retrieveMerchantCustomAttribute(
  merchantId,
  key,
  withDefinition
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

# Upsert Merchant Custom Attribute

Creates or updates a [custom attribute](../../doc/models/custom-attribute.md) for a merchant.
Use this endpoint to set the value of a custom attribute for a specified merchant.
A custom attribute is based on a custom attribute definition in a Square seller account, which
is created using the [CreateMerchantCustomAttributeDefinition](../../doc/api/merchant-custom-attributes.md#create-merchant-custom-attribute-definition) endpoint.
To create or update a custom attribute owned by another application, the `visibility` setting
must be `VISIBILITY_READ_WRITE_VALUES`.

```ts
async upsertMerchantCustomAttribute(
  merchantId: string,
  key: string,
  body: UpsertMerchantCustomAttributeRequest,
  requestOptions?: RequestOptions
): Promise<ApiResponse<UpsertMerchantCustomAttributeResponse>>
```
