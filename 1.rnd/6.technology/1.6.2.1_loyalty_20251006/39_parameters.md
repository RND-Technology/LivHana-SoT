## Parameters

| Parameter | Type | Tags | Description |
|  --- | --- | --- | --- |
| `promotionId` | `string` | Template, Required | The ID of the [loyalty promotion](entity:LoyaltyPromotion) to cancel. You can cancel a<br>promotion that has an `ACTIVE` or `SCHEDULED` status. |
| `programId` | `string` | Template, Required | The ID of the base [loyalty program](entity:LoyaltyProgram). |
| `requestOptions` | `RequestOptions \| undefined` | Optional | Pass additional request options. |
