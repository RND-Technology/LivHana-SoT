## Methods

* [List Bookings](../../doc/api/bookings.md#list-bookings)
* [Create Booking](../../doc/api/bookings.md#create-booking)
* [Search Availability](../../doc/api/bookings.md#search-availability)
* [Bulk Retrieve Bookings](../../doc/api/bookings.md#bulk-retrieve-bookings)
* [Retrieve Business Booking Profile](../../doc/api/bookings.md#retrieve-business-booking-profile)
* [List Location Booking Profiles](../../doc/api/bookings.md#list-location-booking-profiles)
* [Retrieve Location Booking Profile](../../doc/api/bookings.md#retrieve-location-booking-profile)
* [List Team Member Booking Profiles](../../doc/api/bookings.md#list-team-member-booking-profiles)
* [Bulk Retrieve Team Member Booking Profiles](../../doc/api/bookings.md#bulk-retrieve-team-member-booking-profiles)
* [Retrieve Team Member Booking Profile](../../doc/api/bookings.md#retrieve-team-member-booking-profile)
* [Retrieve Booking](../../doc/api/bookings.md#retrieve-booking)
* [Update Booking](../../doc/api/bookings.md#update-booking)
* [Cancel Booking](../../doc/api/bookings.md#cancel-booking)

# List Bookings

Retrieve a collection of bookings.

To call this endpoint with buyer-level permissions, set `APPOINTMENTS_READ` for the OAuth scope.
To call this endpoint with seller-level permissions, set `APPOINTMENTS_ALL_READ` and `APPOINTMENTS_READ` for the OAuth scope.

```ts
async listBookings(
  limit?: number,
  cursor?: string,
  customerId?: string,
  teamMemberId?: string,
  locationId?: string,
  startAtMin?: string,
  startAtMax?: string,
  requestOptions?: RequestOptions
): Promise<ApiResponse<ListBookingsResponse>>
```
