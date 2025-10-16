## Parameters

| Parameter | Type | Tags | Description |
|  --- | --- | --- | --- |
| `merchantId` | `string` | Template, Required | The ID of the target [merchant](entity:Merchant). |
| `key` | `string` | Template, Required | The key of the custom attribute to delete. This key must match the `key` of a custom<br>attribute definition in the Square seller account. If the requesting application is not the<br>definition owner, you must use the qualified key. |
| `requestOptions` | `RequestOptions \| undefined` | Optional | Pass additional request options. |
