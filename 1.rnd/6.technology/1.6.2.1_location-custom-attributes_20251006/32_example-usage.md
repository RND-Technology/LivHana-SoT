## Example Usage

```ts
const locationId = 'location_id4';

const key = 'key0';

const withDefinition = false;

try {
  const { result, ...httpResponse } = await locationCustomAttributesApi.retrieveLocationCustomAttribute(
  locationId,
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

# Upsert Location Custom Attribute

Creates or updates a [custom attribute](../../doc/models/custom-attribute.md) for a location.
Use this endpoint to set the value of a custom attribute for a specified location.
A custom attribute is based on a custom attribute definition in a Square seller account, which
is created using the [CreateLocationCustomAttributeDefinition](../../doc/api/location-custom-attributes.md#create-location-custom-attribute-definition) endpoint.
To create or update a custom attribute owned by another application, the `visibility` setting
must be `VISIBILITY_READ_WRITE_VALUES`.

```ts
async upsertLocationCustomAttribute(
  locationId: string,
  key: string,
  body: UpsertLocationCustomAttributeRequest,
  requestOptions?: RequestOptions
): Promise<ApiResponse<UpsertLocationCustomAttributeResponse>>
```
