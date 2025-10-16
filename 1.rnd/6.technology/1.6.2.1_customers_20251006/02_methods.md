## Methods

* [List Customers](../../doc/api/customers.md#list-customers)
* [Create Customer](../../doc/api/customers.md#create-customer)
* [Bulk Create Customers](../../doc/api/customers.md#bulk-create-customers)
* [Bulk Delete Customers](../../doc/api/customers.md#bulk-delete-customers)
* [Bulk Retrieve Customers](../../doc/api/customers.md#bulk-retrieve-customers)
* [Bulk Update Customers](../../doc/api/customers.md#bulk-update-customers)
* [Search Customers](../../doc/api/customers.md#search-customers)
* [Delete Customer](../../doc/api/customers.md#delete-customer)
* [Retrieve Customer](../../doc/api/customers.md#retrieve-customer)
* [Update Customer](../../doc/api/customers.md#update-customer)
* [Create Customer Card](../../doc/api/customers.md#create-customer-card)
* [Delete Customer Card](../../doc/api/customers.md#delete-customer-card)
* [Remove Group From Customer](../../doc/api/customers.md#remove-group-from-customer)
* [Add Group to Customer](../../doc/api/customers.md#add-group-to-customer)

# List Customers

Lists customer profiles associated with a Square account.

Under normal operating conditions, newly created or updated customer profiles become available
for the listing operation in well under 30 seconds. Occasionally, propagation of the new or updated
profiles can take closer to one minute or longer, especially during network incidents and outages.

```ts
async listCustomers(
  cursor?: string,
  limit?: number,
  sortField?: string,
  sortOrder?: string,
  count?: boolean,
  requestOptions?: RequestOptions
): Promise<ApiResponse<ListCustomersResponse>>
```
