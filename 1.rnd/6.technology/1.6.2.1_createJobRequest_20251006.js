"use strict";
exports.__esModule = true;
exports.createJobRequestSchema = void 0;
const schema_1 = require("../schema");
const job_1 = require("./job");
exports.createJobRequestSchema = (0, schema_1.object)({
    job: ['job', (0, schema_1.lazy)(function () { return job_1.jobSchema; })],
    idempotencyKey: ['idempotency_key', (0, schema_1.string)()]
});
//# sourceMappingURL=createJobRequest.js.map