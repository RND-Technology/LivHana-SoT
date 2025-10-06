"use strict";
exports.__esModule = true;
exports.accumulateLoyaltyPointsResponseSchema = void 0;
const schema_1 = require("../schema");
const error_1 = require("./error");
const loyaltyEvent_1 = require("./loyaltyEvent");
exports.accumulateLoyaltyPointsResponseSchema = (0, schema_1.object)({
    errors: ['errors', (0, schema_1.optional)((0, schema_1.array)((0, schema_1.lazy)(function () { return error_1.errorSchema; })))],
    event: ['event', (0, schema_1.optional)((0, schema_1.lazy)(function () { return loyaltyEvent_1.loyaltyEventSchema; }))],
    events: ['events', (0, schema_1.optional)((0, schema_1.array)((0, schema_1.lazy)(function () { return loyaltyEvent_1.loyaltyEventSchema; })))]
});
//# sourceMappingURL=accumulateLoyaltyPointsResponse.js.map