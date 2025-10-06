"use strict";
exports.__esModule = true;
exports.updateWorkweekConfigResponseSchema = void 0;
const schema_1 = require("../schema");
const error_1 = require("./error");
const workweekConfig_1 = require("./workweekConfig");
exports.updateWorkweekConfigResponseSchema = (0, schema_1.object)({
    workweekConfig: [
        'workweek_config',
        (0, schema_1.optional)((0, schema_1.lazy)(function () { return workweekConfig_1.workweekConfigSchema; })),
    ],
    errors: ['errors', (0, schema_1.optional)((0, schema_1.array)((0, schema_1.lazy)(function () { return error_1.errorSchema; })))]
});
//# sourceMappingURL=updateWorkweekConfigResponse.js.map