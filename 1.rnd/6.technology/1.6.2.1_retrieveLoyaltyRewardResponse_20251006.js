"use strict";
exports.__esModule = true;
exports.retrieveLoyaltyRewardResponseSchema = void 0;
const schema_1 = require("../schema");
const error_1 = require("./error");
const loyaltyReward_1 = require("./loyaltyReward");
exports.retrieveLoyaltyRewardResponseSchema = (0, schema_1.object)({
    errors: ['errors', (0, schema_1.optional)((0, schema_1.array)((0, schema_1.lazy)(function () { return error_1.errorSchema; })))],
    reward: ['reward', (0, schema_1.optional)((0, schema_1.lazy)(function () { return loyaltyReward_1.loyaltyRewardSchema; }))]
});
//# sourceMappingURL=retrieveLoyaltyRewardResponse.js.map