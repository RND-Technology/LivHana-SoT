## Example Usage

```ts
const body: BulkUpsertMerchantCustomAttributesRequest = {
  values: {
    'key0': {
      merchantId: 'merchant_id0',
      customAttribute: {
      },
    },
    'key1': {
      merchantId: 'merchant_id0',
      customAttribute: {
      },
    }
  },
};

try {
  const { result, ...httpResponse } = await merchantCustomAttributesApi.bulkUpsertMerchantCustomAttributes(body);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# List Merchant Custom Attributes

Lists the [custom attributes](../../doc/models/custom-attribute.md) associated with a merchant.
You can use the `with_definitions` query parameter to also retrieve custom attribute definitions
in the same call.
When all response pages are retrieved, the results include all custom attributes that are
visible to the requesting application, including those that are owned by other applications
and set to `VISIBILITY_READ_ONLY` or `VISIBILITY_READ_WRITE_VALUES`.

```ts
async listMerchantCustomAttributes(
  merchantId: string,
  visibilityFilter?: string,
  limit?: number,
  cursor?: string,
  withDefinitions?: boolean,
  requestOptions?: RequestOptions
): Promise<ApiResponse<ListMerchantCustomAttributesResponse>>
```
