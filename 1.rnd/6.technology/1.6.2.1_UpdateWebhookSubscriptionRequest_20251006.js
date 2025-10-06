"use strict";
exports.__esModule = true;
exports.updateWebhookSubscriptionRequestSchema = void 0;
const schema_1 = require("../schema");
const webhookSubscription_1 = require("./webhookSubscription");
exports.updateWebhookSubscriptionRequestSchema = (0, schema_1.object)({
    subscription: [
        'subscription',
        (0, schema_1.optional)((0, schema_1.lazy)(function () { return webhookSubscription_1.webhookSubscriptionSchema; })),
    ]
});
//# sourceMappingURL=updateWebhookSubscriptionRequest.js.map