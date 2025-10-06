"use strict";
exports.__esModule = true;
exports.pauseSubscriptionResponseSchema = void 0;
const schema_1 = require("../schema");
const error_1 = require("./error");
const subscription_1 = require("./subscription");
const subscriptionAction_1 = require("./subscriptionAction");
exports.pauseSubscriptionResponseSchema = (0, schema_1.object)({
    errors: ['errors', (0, schema_1.optional)((0, schema_1.array)((0, schema_1.lazy)(function () { return error_1.errorSchema; })))],
    subscription: ['subscription', (0, schema_1.optional)((0, schema_1.lazy)(function () { return subscription_1.subscriptionSchema; }))],
    actions: ['actions', (0, schema_1.optional)((0, schema_1.array)((0, schema_1.lazy)(function () { return subscriptionAction_1.subscriptionActionSchema; })))]
});
//# sourceMappingURL=pauseSubscriptionResponse.js.map