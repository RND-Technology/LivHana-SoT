## Example Usage

```ts
const body: BulkUpsertLocationCustomAttributesRequest = {
  values: {
    'key0': {
      locationId: 'location_id4',
      customAttribute: {
      },
    },
    'key1': {
      locationId: 'location_id4',
      customAttribute: {
      },
    }
  },
};

try {
  const { result, ...httpResponse } = await locationCustomAttributesApi.bulkUpsertLocationCustomAttributes(body);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# List Location Custom Attributes

Lists the [custom attributes](../../doc/models/custom-attribute.md) associated with a location.
You can use the `with_definitions` query parameter to also retrieve custom attribute definitions
in the same call.
When all response pages are retrieved, the results include all custom attributes that are
visible to the requesting application, including those that are owned by other applications
and set to `VISIBILITY_READ_ONLY` or `VISIBILITY_READ_WRITE_VALUES`.

```ts
async listLocationCustomAttributes(
  locationId: string,
  visibilityFilter?: string,
  limit?: number,
  cursor?: string,
  withDefinitions?: boolean,
  requestOptions?: RequestOptions
): Promise<ApiResponse<ListLocationCustomAttributesResponse>>
```
