"use strict";
exports.__esModule = true;
exports.retrieveDisputeEvidenceResponseSchema = void 0;
const schema_1 = require("../schema");
const disputeEvidence_1 = require("./disputeEvidence");
const error_1 = require("./error");
exports.retrieveDisputeEvidenceResponseSchema = (0, schema_1.object)({
    errors: ['errors', (0, schema_1.optional)((0, schema_1.array)((0, schema_1.lazy)(function () { return error_1.errorSchema; })))],
    evidence: ['evidence', (0, schema_1.optional)((0, schema_1.lazy)(function () { return disputeEvidence_1.disputeEvidenceSchema; }))]
});
//# sourceMappingURL=retrieveDisputeEvidenceResponse.js.map