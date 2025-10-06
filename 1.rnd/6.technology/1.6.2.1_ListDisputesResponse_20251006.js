"use strict";
exports.__esModule = true;
exports.listDisputesResponseSchema = void 0;
const schema_1 = require("../schema");
const dispute_1 = require("./dispute");
const error_1 = require("./error");
exports.listDisputesResponseSchema = (0, schema_1.object)({
    errors: ['errors', (0, schema_1.optional)((0, schema_1.array)((0, schema_1.lazy)(function () { return error_1.errorSchema; })))],
    disputes: ['disputes', (0, schema_1.optional)((0, schema_1.array)((0, schema_1.lazy)(function () { return dispute_1.disputeSchema; })))],
    cursor: ['cursor', (0, schema_1.optional)((0, schema_1.string)())]
});
//# sourceMappingURL=listDisputesResponse.js.map