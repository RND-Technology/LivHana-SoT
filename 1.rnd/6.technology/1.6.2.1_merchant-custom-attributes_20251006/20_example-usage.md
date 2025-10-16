## Example Usage

```ts
const body: BulkDeleteMerchantCustomAttributesRequest = {
  values: {
    'id1': {
    },
    'id2': {
    }
  },
};

try {
  const { result, ...httpResponse } = await merchantCustomAttributesApi.bulkDeleteMerchantCustomAttributes(body);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Bulk Upsert Merchant Custom Attributes

Creates or updates [custom attributes](../../doc/models/custom-attribute.md) for a merchant as a bulk operation.
Use this endpoint to set the value of one or more custom attributes for a merchant.
A custom attribute is based on a custom attribute definition in a Square seller account, which is
created using the [CreateMerchantCustomAttributeDefinition](../../doc/api/merchant-custom-attributes.md#create-merchant-custom-attribute-definition) endpoint.
This `BulkUpsertMerchantCustomAttributes` endpoint accepts a map of 1 to 25 individual upsert
requests and returns a map of individual upsert responses. Each upsert request has a unique ID
and provides a merchant ID and custom attribute. Each upsert response is returned with the ID
of the corresponding request.
To create or update a custom attribute owned by another application, the `visibility` setting
must be `VISIBILITY_READ_WRITE_VALUES`.

```ts
async bulkUpsertMerchantCustomAttributes(
  body: BulkUpsertMerchantCustomAttributesRequest,
  requestOptions?: RequestOptions
): Promise<ApiResponse<BulkUpsertMerchantCustomAttributesResponse>>
```
