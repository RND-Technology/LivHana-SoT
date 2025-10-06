"use strict";
exports.__esModule = true;
exports.createWebhookSubscriptionResponseSchema = void 0;
const schema_1 = require("../schema");
const error_1 = require("./error");
const webhookSubscription_1 = require("./webhookSubscription");
exports.createWebhookSubscriptionResponseSchema = (0, schema_1.object)({
    errors: ['errors', (0, schema_1.optional)((0, schema_1.array)((0, schema_1.lazy)(function () { return error_1.errorSchema; })))],
    subscription: [
        'subscription',
        (0, schema_1.optional)((0, schema_1.lazy)(function () { return webhookSubscription_1.webhookSubscriptionSchema; })),
    ]
});
//# sourceMappingURL=createWebhookSubscriptionResponse.js.map