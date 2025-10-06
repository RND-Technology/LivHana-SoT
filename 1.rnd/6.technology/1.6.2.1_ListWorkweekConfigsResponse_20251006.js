"use strict";
exports.__esModule = true;
exports.listWorkweekConfigsResponseSchema = void 0;
const schema_1 = require("../schema");
const error_1 = require("./error");
const workweekConfig_1 = require("./workweekConfig");
exports.listWorkweekConfigsResponseSchema = (0, schema_1.object)({
    workweekConfigs: [
        'workweek_configs',
        (0, schema_1.optional)((0, schema_1.array)((0, schema_1.lazy)(function () { return workweekConfig_1.workweekConfigSchema; }))),
    ],
    cursor: ['cursor', (0, schema_1.optional)((0, schema_1.string)())],
    errors: ['errors', (0, schema_1.optional)((0, schema_1.array)((0, schema_1.lazy)(function () { return error_1.errorSchema; })))]
});
//# sourceMappingURL=listWorkweekConfigsResponse.js.map