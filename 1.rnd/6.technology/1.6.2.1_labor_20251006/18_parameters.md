## Parameters

| Parameter | Type | Tags | Description |
|  --- | --- | --- | --- |
| `employeeId` | `string \| undefined` | Query, Optional | Filter the returned wages to only those that are associated with the specified employee. |
| `limit` | `number \| undefined` | Query, Optional | The maximum number of `EmployeeWage` results to return per page. The number can range between<br>1 and 200. The default is 200. |
| `cursor` | `string \| undefined` | Query, Optional | A pointer to the next page of `EmployeeWage` results to fetch. |
| `requestOptions` | `RequestOptions \| undefined` | Optional | Pass additional request options. |
