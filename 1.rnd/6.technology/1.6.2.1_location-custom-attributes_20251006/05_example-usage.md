## Example Usage

```ts
try {
  const { result, ...httpResponse } = await locationCustomAttributesApi.listLocationCustomAttributeDefinitions();
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Create Location Custom Attribute Definition

Creates a location-related [custom attribute definition](../../doc/models/custom-attribute-definition.md) for a Square seller account.
Use this endpoint to define a custom attribute that can be associated with locations.
A custom attribute definition specifies the `key`, `visibility`, `schema`, and other properties
for a custom attribute. After the definition is created, you can call
[UpsertLocationCustomAttribute](../../doc/api/location-custom-attributes.md#upsert-location-custom-attribute) or
[BulkUpsertLocationCustomAttributes](../../doc/api/location-custom-attributes.md#bulk-upsert-location-custom-attributes)
to set the custom attribute for locations.

```ts
async createLocationCustomAttributeDefinition(
  body: CreateLocationCustomAttributeDefinitionRequest,
  requestOptions?: RequestOptions
): Promise<ApiResponse<CreateLocationCustomAttributeDefinitionResponse>>
```
