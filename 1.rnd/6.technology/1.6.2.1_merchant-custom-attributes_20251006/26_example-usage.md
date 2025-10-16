## Example Usage

```ts
const merchantId = 'merchant_id0';

const withDefinitions = false;

try {
  const { result, ...httpResponse } = await merchantCustomAttributesApi.listMerchantCustomAttributes(
  merchantId,
  undefined,
  undefined,
  undefined,
  withDefinitions
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

# Delete Merchant Custom Attribute

Deletes a [custom attribute](../../doc/models/custom-attribute.md) associated with a merchant.
To delete a custom attribute owned by another application, the `visibility` setting must be
`VISIBILITY_READ_WRITE_VALUES`.

```ts
async deleteMerchantCustomAttribute(
  merchantId: string,
  key: string,
  requestOptions?: RequestOptions
): Promise<ApiResponse<DeleteMerchantCustomAttributeResponse>>
```
