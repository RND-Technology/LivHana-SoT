## Parameters

| Parameter | Type | Tags | Description |
|  --- | --- | --- | --- |
| `invoiceId` | `string` | Template, Required | The ID of the invoice to delete. |
| `version` | `number \| undefined` | Query, Optional | The version of the [invoice](entity:Invoice) to delete.<br>If you do not know the version, you can call [GetInvoice](api-endpoint:Invoices-GetInvoice) or<br>[ListInvoices](api-endpoint:Invoices-ListInvoices). |
| `requestOptions` | `RequestOptions \| undefined` | Optional | Pass additional request options. |
