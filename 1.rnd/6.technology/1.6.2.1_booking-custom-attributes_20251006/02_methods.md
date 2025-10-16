## Methods

* [List Booking Custom Attribute Definitions](../../doc/api/booking-custom-attributes.md#list-booking-custom-attribute-definitions)
* [Create Booking Custom Attribute Definition](../../doc/api/booking-custom-attributes.md#create-booking-custom-attribute-definition)
* [Delete Booking Custom Attribute Definition](../../doc/api/booking-custom-attributes.md#delete-booking-custom-attribute-definition)
* [Retrieve Booking Custom Attribute Definition](../../doc/api/booking-custom-attributes.md#retrieve-booking-custom-attribute-definition)
* [Update Booking Custom Attribute Definition](../../doc/api/booking-custom-attributes.md#update-booking-custom-attribute-definition)
* [Bulk Delete Booking Custom Attributes](../../doc/api/booking-custom-attributes.md#bulk-delete-booking-custom-attributes)
* [Bulk Upsert Booking Custom Attributes](../../doc/api/booking-custom-attributes.md#bulk-upsert-booking-custom-attributes)
* [List Booking Custom Attributes](../../doc/api/booking-custom-attributes.md#list-booking-custom-attributes)
* [Delete Booking Custom Attribute](../../doc/api/booking-custom-attributes.md#delete-booking-custom-attribute)
* [Retrieve Booking Custom Attribute](../../doc/api/booking-custom-attributes.md#retrieve-booking-custom-attribute)
* [Upsert Booking Custom Attribute](../../doc/api/booking-custom-attributes.md#upsert-booking-custom-attribute)

# List Booking Custom Attribute Definitions

Get all bookings custom attribute definitions.

To call this endpoint with buyer-level permissions, set `APPOINTMENTS_READ` for the OAuth scope.
To call this endpoint with seller-level permissions, set `APPOINTMENTS_ALL_READ` and `APPOINTMENTS_READ` for the OAuth scope.

```ts
async listBookingCustomAttributeDefinitions(
  limit?: number,
  cursor?: string,
  requestOptions?: RequestOptions
): Promise<ApiResponse<ListBookingCustomAttributeDefinitionsResponse>>
```
