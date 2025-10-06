"use strict";
exports.__esModule = true;
exports.listPayoutsResponseSchema = void 0;
const schema_1 = require("../schema");
const error_1 = require("./error");
const payout_1 = require("./payout");
exports.listPayoutsResponseSchema = (0, schema_1.object)({
    payouts: ['payouts', (0, schema_1.optional)((0, schema_1.array)((0, schema_1.lazy)(function () { return payout_1.payoutSchema; })))],
    cursor: ['cursor', (0, schema_1.optional)((0, schema_1.string)())],
    errors: ['errors', (0, schema_1.optional)((0, schema_1.array)((0, schema_1.lazy)(function () { return error_1.errorSchema; })))]
});
//# sourceMappingURL=listPayoutsResponse.js.map