"use strict";
exports.__esModule = true;
exports.updateJobResponseSchema = void 0;
const schema_1 = require("../schema");
const error_1 = require("./error");
const job_1 = require("./job");
exports.updateJobResponseSchema = (0, schema_1.object)({
    job: ['job', (0, schema_1.optional)((0, schema_1.lazy)(function () { return job_1.jobSchema; }))],
    errors: ['errors', (0, schema_1.optional)((0, schema_1.array)((0, schema_1.lazy)(function () { return error_1.errorSchema; })))]
});
//# sourceMappingURL=updateJobResponse.js.map