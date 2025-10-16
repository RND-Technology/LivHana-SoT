## Example Usage

```ts
const catalogObjectId = 'catalog_object_id6';

try {
  const { result, ...httpResponse } = await inventoryApi.retrieveInventoryCount(catalogObjectId);
  // Get more response info...
  // const { statusCode, headers } = httpResponse;
} catch (error) {
  if (error instanceof ApiError) {
    const errors = error.result;
    // const { statusCode, headers } = error;
  }
}
```

# Retrieve Inventory Changes

**This endpoint is deprecated.**

Returns a set of physical counts and inventory adjustments for the
provided [CatalogObject](entity:CatalogObject) at the requested
[Location](entity:Location)s.

You can achieve the same result by calling [BatchRetrieveInventoryChanges](api-endpoint:Inventory-BatchRetrieveInventoryChanges)
and having the `catalog_object_ids` list contain a single element of the `CatalogObject` ID.

Results are paginated and sorted in descending order according to their
`occurred_at` timestamp (newest first).

There are no limits on how far back the caller can page. This endpoint can be
used to display recent changes for a specific item. For more
sophisticated queries, use a batch endpoint.

```ts
async retrieveInventoryChanges(
  catalogObjectId: string,
  locationIds?: string,
  cursor?: string,
  requestOptions?: RequestOptions
): Promise<ApiResponse<RetrieveInventoryChangesResponse>>
```
