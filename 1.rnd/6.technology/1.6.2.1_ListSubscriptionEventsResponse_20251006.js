"use strict";
exports.__esModule = true;
exports.listSubscriptionEventsResponseSchema = void 0;
const schema_1 = require("../schema");
const error_1 = require("./error");
const subscriptionEvent_1 = require("./subscriptionEvent");
exports.listSubscriptionEventsResponseSchema = (0, schema_1.object)({
    errors: ['errors', (0, schema_1.optional)((0, schema_1.array)((0, schema_1.lazy)(function () { return error_1.errorSchema; })))],
    subscriptionEvents: [
        'subscription_events',
        (0, schema_1.optional)((0, schema_1.array)((0, schema_1.lazy)(function () { return subscriptionEvent_1.subscriptionEventSchema; }))),
    ],
    cursor: ['cursor', (0, schema_1.optional)((0, schema_1.string)())]
});
//# sourceMappingURL=listSubscriptionEventsResponse.js.map