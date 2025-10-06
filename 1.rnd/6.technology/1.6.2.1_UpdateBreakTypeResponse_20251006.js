"use strict";
exports.__esModule = true;
exports.updateBreakTypeResponseSchema = void 0;
const schema_1 = require("../schema");
const breakType_1 = require("./breakType");
const error_1 = require("./error");
exports.updateBreakTypeResponseSchema = (0, schema_1.object)({
    breakType: ['break_type', (0, schema_1.optional)((0, schema_1.lazy)(function () { return breakType_1.breakTypeSchema; }))],
    errors: ['errors', (0, schema_1.optional)((0, schema_1.array)((0, schema_1.lazy)(function () { return error_1.errorSchema; })))]
});
//# sourceMappingURL=updateBreakTypeResponse.js.map