## Example Usage

```ts
const body: CreateLocationCustomAttributeDefinitionRequest = {
  customAttributeDefinition: {
    key: 'bestseller',
    name: 'Bestseller',
    description: 'Bestselling item at location',
    visibility: 'VISIBILITY_READ_WRITE_VALUES',
  },
};

try {
  const { result, ...httpResponse } = await locationCustomAttributesApi.createLocationCustomAttributeDefinition(body);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Delete Location Custom Attribute Definition

Deletes a location-related [custom attribute definition](../../doc/models/custom-attribute-definition.md) from a Square seller account.
Deleting a custom attribute definition also deletes the corresponding custom attribute from
all locations.
Only the definition owner can delete a custom attribute definition.

```ts
async deleteLocationCustomAttributeDefinition(
  key: string,
  requestOptions?: RequestOptions
): Promise<ApiResponse<DeleteLocationCustomAttributeDefinitionResponse>>
```
