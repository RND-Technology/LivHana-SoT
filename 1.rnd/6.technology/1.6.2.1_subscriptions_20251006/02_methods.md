## Methods

* [Create Subscription](../../doc/api/subscriptions.md#create-subscription)
* [Bulk Swap Plan](../../doc/api/subscriptions.md#bulk-swap-plan)
* [Search Subscriptions](../../doc/api/subscriptions.md#search-subscriptions)
* [Retrieve Subscription](../../doc/api/subscriptions.md#retrieve-subscription)
* [Update Subscription](../../doc/api/subscriptions.md#update-subscription)
* [Delete Subscription Action](../../doc/api/subscriptions.md#delete-subscription-action)
* [Change Billing Anchor Date](../../doc/api/subscriptions.md#change-billing-anchor-date)
* [Cancel Subscription](../../doc/api/subscriptions.md#cancel-subscription)
* [List Subscription Events](../../doc/api/subscriptions.md#list-subscription-events)
* [Pause Subscription](../../doc/api/subscriptions.md#pause-subscription)
* [Resume Subscription](../../doc/api/subscriptions.md#resume-subscription)
* [Swap Plan](../../doc/api/subscriptions.md#swap-plan)

# Create Subscription

Enrolls a customer in a subscription.

If you provide a card on file in the request, Square charges the card for
the subscription. Otherwise, Square sends an invoice to the customer's email
address. The subscription starts immediately, unless the request includes
the optional `start_date`. Each individual subscription is associated with a particular location.

For more information, see [Create a subscription](https://developer.squareup.com/docs/subscriptions-api/manage-subscriptions#create-a-subscription).

```ts
async createSubscription(
  body: CreateSubscriptionRequest,
  requestOptions?: RequestOptions
): Promise<ApiResponse<CreateSubscriptionResponse>>
```
