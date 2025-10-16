## Parameters

| Parameter | Type | Tags | Description |
|  --- | --- | --- | --- |
| `promotionId` | `string` | Template, Required | The ID of the [loyalty promotion](entity:LoyaltyPromotion) to retrieve. |
| `programId` | `string` | Template, Required | The ID of the base [loyalty program](entity:LoyaltyProgram). To get the program ID,<br>call [RetrieveLoyaltyProgram](api-endpoint:Loyalty-RetrieveLoyaltyProgram) using the `main` keyword. |
| `requestOptions` | `RequestOptions \| undefined` | Optional | Pass additional request options. |
