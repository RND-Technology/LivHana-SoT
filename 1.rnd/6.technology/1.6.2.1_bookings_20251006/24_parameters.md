## Parameters

| Parameter | Type | Tags | Description |
|  --- | --- | --- | --- |
| `bookableOnly` | `boolean \| undefined` | Query, Optional | Indicates whether to include only bookable team members in the returned result (`true`) or not (`false`).<br>**Default**: `false` |
| `limit` | `number \| undefined` | Query, Optional | The maximum number of results to return in a paged response. |
| `cursor` | `string \| undefined` | Query, Optional | The pagination cursor from the preceding response to return the next page of the results. Do not set this when retrieving the first page of the results. |
| `locationId` | `string \| undefined` | Query, Optional | Indicates whether to include only team members enabled at the given location in the returned result. |
| `requestOptions` | `RequestOptions \| undefined` | Optional | Pass additional request options. |
