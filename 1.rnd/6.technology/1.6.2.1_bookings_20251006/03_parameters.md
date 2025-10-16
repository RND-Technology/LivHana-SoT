## Parameters

| Parameter | Type | Tags | Description |
|  --- | --- | --- | --- |
| `limit` | `number \| undefined` | Query, Optional | The maximum number of results per page to return in a paged response. |
| `cursor` | `string \| undefined` | Query, Optional | The pagination cursor from the preceding response to return the next page of the results. Do not set this when retrieving the first page of the results. |
| `customerId` | `string \| undefined` | Query, Optional | The [customer](entity:Customer) for whom to retrieve bookings. If this is not set, bookings for all customers are retrieved. |
| `teamMemberId` | `string \| undefined` | Query, Optional | The team member for whom to retrieve bookings. If this is not set, bookings of all members are retrieved. |
| `locationId` | `string \| undefined` | Query, Optional | The location for which to retrieve bookings. If this is not set, all locations' bookings are retrieved. |
| `startAtMin` | `string \| undefined` | Query, Optional | The RFC 3339 timestamp specifying the earliest of the start time. If this is not set, the current time is used. |
| `startAtMax` | `string \| undefined` | Query, Optional | The RFC 3339 timestamp specifying the latest of the start time. If this is not set, the time of 31 days after `start_at_min` is used. |
| `requestOptions` | `RequestOptions \| undefined` | Optional | Pass additional request options. |
