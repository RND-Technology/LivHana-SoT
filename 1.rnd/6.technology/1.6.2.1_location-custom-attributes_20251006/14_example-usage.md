## Example Usage

```ts
const key = 'key0';

try {
  const { result, ...httpResponse } = await locationCustomAttributesApi.retrieveLocationCustomAttributeDefinition(key);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Update Location Custom Attribute Definition

Updates a location-related [custom attribute definition](../../doc/models/custom-attribute-definition.md) for a Square seller account.
Use this endpoint to update the following fields: `name`, `description`, `visibility`, or the
`schema` for a `Selection` data type.
Only the definition owner can update a custom attribute definition.

```ts
async updateLocationCustomAttributeDefinition(
  key: string,
  body: UpdateLocationCustomAttributeDefinitionRequest,
  requestOptions?: RequestOptions
): Promise<ApiResponse<UpdateLocationCustomAttributeDefinitionResponse>>
```
