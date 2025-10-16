## Methods

* [List Invoices](../../doc/api/invoices.md#list-invoices)
* [Create Invoice](../../doc/api/invoices.md#create-invoice)
* [Search Invoices](../../doc/api/invoices.md#search-invoices)
* [Delete Invoice](../../doc/api/invoices.md#delete-invoice)
* [Get Invoice](../../doc/api/invoices.md#get-invoice)
* [Update Invoice](../../doc/api/invoices.md#update-invoice)
* [Create Invoice Attachment](../../doc/api/invoices.md#create-invoice-attachment)
* [Delete Invoice Attachment](../../doc/api/invoices.md#delete-invoice-attachment)
* [Cancel Invoice](../../doc/api/invoices.md#cancel-invoice)
* [Publish Invoice](../../doc/api/invoices.md#publish-invoice)

# List Invoices

Returns a list of invoices for a given location. The response
is paginated. If truncated, the response includes a `cursor` that you  
use in a subsequent request to retrieve the next set of invoices.

```ts
async listInvoices(
  locationId: string,
  cursor?: string,
  limit?: number,
  requestOptions?: RequestOptions
): Promise<ApiResponse<ListInvoicesResponse>>
```
