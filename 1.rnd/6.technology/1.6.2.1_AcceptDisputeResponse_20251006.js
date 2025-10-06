"use strict";
exports.__esModule = true;
exports.acceptDisputeResponseSchema = void 0;
const schema_1 = require("../schema");
const dispute_1 = require("./dispute");
const error_1 = require("./error");
exports.acceptDisputeResponseSchema = (0, schema_1.object)({
    errors: ['errors', (0, schema_1.optional)((0, schema_1.array)((0, schema_1.lazy)(function () { return error_1.errorSchema; })))],
    dispute: ['dispute', (0, schema_1.optional)((0, schema_1.lazy)(function () { return dispute_1.disputeSchema; }))]
});
//# sourceMappingURL=acceptDisputeResponse.js.map