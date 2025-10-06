"use strict";
exports.__esModule = true;
exports.updateWorkweekConfigRequestSchema = void 0;
const schema_1 = require("../schema");
const workweekConfig_1 = require("./workweekConfig");
exports.updateWorkweekConfigRequestSchema = (0, schema_1.object)({ workweekConfig: ['workweek_config', (0, schema_1.lazy)(function () { return workweekConfig_1.workweekConfigSchema; })] });
//# sourceMappingURL=updateWorkweekConfigRequest.js.map