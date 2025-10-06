"use strict";
exports.__esModule = true;
exports.accumulateLoyaltyPointsRequestSchema = void 0;
const schema_1 = require("../schema");
const loyaltyEventAccumulatePoints_1 = require("./loyaltyEventAccumulatePoints");
exports.accumulateLoyaltyPointsRequestSchema = (0, schema_1.object)({
    accumulatePoints: [
        'accumulate_points',
        (0, schema_1.lazy)(function () { return loyaltyEventAccumulatePoints_1.loyaltyEventAccumulatePointsSchema; }),
    ],
    idempotencyKey: ['idempotency_key', (0, schema_1.string)()],
    locationId: ['location_id', (0, schema_1.string)()]
});
//# sourceMappingURL=accumulateLoyaltyPointsRequest.js.map