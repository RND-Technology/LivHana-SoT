## Methods

* [Create Loyalty Account](../../doc/api/loyalty.md#create-loyalty-account)
* [Search Loyalty Accounts](../../doc/api/loyalty.md#search-loyalty-accounts)
* [Retrieve Loyalty Account](../../doc/api/loyalty.md#retrieve-loyalty-account)
* [Accumulate Loyalty Points](../../doc/api/loyalty.md#accumulate-loyalty-points)
* [Adjust Loyalty Points](../../doc/api/loyalty.md#adjust-loyalty-points)
* [Search Loyalty Events](../../doc/api/loyalty.md#search-loyalty-events)
* [List Loyalty Programs](../../doc/api/loyalty.md#list-loyalty-programs)
* [Retrieve Loyalty Program](../../doc/api/loyalty.md#retrieve-loyalty-program)
* [Calculate Loyalty Points](../../doc/api/loyalty.md#calculate-loyalty-points)
* [List Loyalty Promotions](../../doc/api/loyalty.md#list-loyalty-promotions)
* [Create Loyalty Promotion](../../doc/api/loyalty.md#create-loyalty-promotion)
* [Retrieve Loyalty Promotion](../../doc/api/loyalty.md#retrieve-loyalty-promotion)
* [Cancel Loyalty Promotion](../../doc/api/loyalty.md#cancel-loyalty-promotion)
* [Create Loyalty Reward](../../doc/api/loyalty.md#create-loyalty-reward)
* [Search Loyalty Rewards](../../doc/api/loyalty.md#search-loyalty-rewards)
* [Delete Loyalty Reward](../../doc/api/loyalty.md#delete-loyalty-reward)
* [Retrieve Loyalty Reward](../../doc/api/loyalty.md#retrieve-loyalty-reward)
* [Redeem Loyalty Reward](../../doc/api/loyalty.md#redeem-loyalty-reward)

# Create Loyalty Account

Creates a loyalty account. To create a loyalty account, you must provide the `program_id` and a `mapping` with the `phone_number` of the buyer.

```ts
async createLoyaltyAccount(
  body: CreateLoyaltyAccountRequest,
  requestOptions?: RequestOptions
): Promise<ApiResponse<CreateLoyaltyAccountResponse>>
```
