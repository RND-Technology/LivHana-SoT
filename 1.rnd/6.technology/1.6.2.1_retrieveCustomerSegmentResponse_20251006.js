"use strict";
exports.__esModule = true;
exports.retrieveCustomerSegmentResponseSchema = void 0;
const schema_1 = require("../schema");
const customerSegment_1 = require("./customerSegment");
const error_1 = require("./error");
exports.retrieveCustomerSegmentResponseSchema = (0, schema_1.object)({
    errors: ['errors', (0, schema_1.optional)((0, schema_1.array)((0, schema_1.lazy)(function () { return error_1.errorSchema; })))],
    segment: ['segment', (0, schema_1.optional)((0, schema_1.lazy)(function () { return customerSegment_1.customerSegmentSchema; }))]
});
//# sourceMappingURL=retrieveCustomerSegmentResponse.js.map