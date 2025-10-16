## Example Usage

```ts
const merchantId = 'merchant_id0';

const key = 'key0';

try {
  const { result, ...httpResponse } = await merchantCustomAttributesApi.deleteMerchantCustomAttribute(
  merchantId,
  key
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

# Retrieve Merchant Custom Attribute

Retrieves a [custom attribute](../../doc/models/custom-attribute.md) associated with a merchant.
You can use the `with_definition` query parameter to also retrieve the custom attribute definition
in the same call.
To retrieve a custom attribute owned by another application, the `visibility` setting must be
`VISIBILITY_READ_ONLY` or `VISIBILITY_READ_WRITE_VALUES`.

```ts
async retrieveMerchantCustomAttribute(
  merchantId: string,
  key: string,
  withDefinition?: boolean,
  version?: number,
  requestOptions?: RequestOptions
): Promise<ApiResponse<RetrieveMerchantCustomAttributeResponse>>
```
