## Example Usage

```ts
const body: BulkDeleteLocationCustomAttributesRequest = {
  values: {
    'id1': {
    },
    'id2': {
    },
    'id3': {
    }
  },
};

try {
  const { result, ...httpResponse } = await locationCustomAttributesApi.bulkDeleteLocationCustomAttributes(body);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Bulk Upsert Location Custom Attributes

Creates or updates [custom attributes](../../doc/models/custom-attribute.md) for locations as a bulk operation.
Use this endpoint to set the value of one or more custom attributes for one or more locations.
A custom attribute is based on a custom attribute definition in a Square seller account, which is
created using the [CreateLocationCustomAttributeDefinition](../../doc/api/location-custom-attributes.md#create-location-custom-attribute-definition) endpoint.
This `BulkUpsertLocationCustomAttributes` endpoint accepts a map of 1 to 25 individual upsert
requests and returns a map of individual upsert responses. Each upsert request has a unique ID
and provides a location ID and custom attribute. Each upsert response is returned with the ID
of the corresponding request.
To create or update a custom attribute owned by another application, the `visibility` setting
must be `VISIBILITY_READ_WRITE_VALUES`.

```ts
async bulkUpsertLocationCustomAttributes(
  body: BulkUpsertLocationCustomAttributesRequest,
  requestOptions?: RequestOptions
): Promise<ApiResponse<BulkUpsertLocationCustomAttributesResponse>>
```
