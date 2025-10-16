## Methods

* [List Order Custom Attribute Definitions](../../doc/api/order-custom-attributes.md#list-order-custom-attribute-definitions)
* [Create Order Custom Attribute Definition](../../doc/api/order-custom-attributes.md#create-order-custom-attribute-definition)
* [Delete Order Custom Attribute Definition](../../doc/api/order-custom-attributes.md#delete-order-custom-attribute-definition)
* [Retrieve Order Custom Attribute Definition](../../doc/api/order-custom-attributes.md#retrieve-order-custom-attribute-definition)
* [Update Order Custom Attribute Definition](../../doc/api/order-custom-attributes.md#update-order-custom-attribute-definition)
* [Bulk Delete Order Custom Attributes](../../doc/api/order-custom-attributes.md#bulk-delete-order-custom-attributes)
* [Bulk Upsert Order Custom Attributes](../../doc/api/order-custom-attributes.md#bulk-upsert-order-custom-attributes)
* [List Order Custom Attributes](../../doc/api/order-custom-attributes.md#list-order-custom-attributes)
* [Delete Order Custom Attribute](../../doc/api/order-custom-attributes.md#delete-order-custom-attribute)
* [Retrieve Order Custom Attribute](../../doc/api/order-custom-attributes.md#retrieve-order-custom-attribute)
* [Upsert Order Custom Attribute](../../doc/api/order-custom-attributes.md#upsert-order-custom-attribute)

# List Order Custom Attribute Definitions

Lists the order-related [custom attribute definitions](../../doc/models/custom-attribute-definition.md) that belong to a Square seller account.

When all response pages are retrieved, the results include all custom attribute definitions
that are visible to the requesting application, including those that are created by other
applications and set to `VISIBILITY_READ_ONLY` or `VISIBILITY_READ_WRITE_VALUES`. Note that
seller-defined custom attributes (also known as custom fields) are always set to `VISIBILITY_READ_WRITE_VALUES`.

```ts
async listOrderCustomAttributeDefinitions(
  visibilityFilter?: string,
  cursor?: string,
  limit?: number,
  requestOptions?: RequestOptions
): Promise<ApiResponse<ListOrderCustomAttributeDefinitionsResponse>>
```
