## Parameters

| Parameter | Type | Tags | Description |
|  --- | --- | --- | --- |
| `cursor` | `string \| undefined` | Query, Optional | A pagination cursor returned by a previous call to this endpoint.<br>Provide this cursor to retrieve the next set of results for your original query.<br><br>For more information, see [Pagination](https://developer.squareup.com/docs/build-basics/common-api-patterns/pagination). |
| `limit` | `number \| undefined` | Query, Optional | The maximum number of results to return in a single page. This limit is advisory. The response might contain more or fewer results.<br>If the specified limit is less than 1 or greater than 100, Square returns a `400 VALUE_TOO_LOW` or `400 VALUE_TOO_HIGH` error. The default value is 100.<br><br>For more information, see [Pagination](https://developer.squareup.com/docs/build-basics/common-api-patterns/pagination). |
| `sortField` | [`string \| undefined`](../../doc/models/customer-sort-field.md) | Query, Optional | Indicates how customers should be sorted.<br><br>The default value is `DEFAULT`. |
| `sortOrder` | [`string \| undefined`](../../doc/models/sort-order.md) | Query, Optional | Indicates whether customers should be sorted in ascending (`ASC`) or<br>descending (`DESC`) order.<br><br>The default value is `ASC`. |
| `count` | `boolean \| undefined` | Query, Optional | Indicates whether to return the total count of customers in the `count` field of the response.<br><br>The default value is `false`.<br>**Default**: `false` |
| `requestOptions` | `RequestOptions \| undefined` | Optional | Pass additional request options. |
