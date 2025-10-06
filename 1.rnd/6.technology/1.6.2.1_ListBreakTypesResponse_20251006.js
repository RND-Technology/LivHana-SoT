"use strict";
exports.__esModule = true;
exports.listBreakTypesResponseSchema = void 0;
const schema_1 = require("../schema");
const breakType_1 = require("./breakType");
const error_1 = require("./error");
exports.listBreakTypesResponseSchema = (0, schema_1.object)({
    breakTypes: ['break_types', (0, schema_1.optional)((0, schema_1.array)((0, schema_1.lazy)(function () { return breakType_1.breakTypeSchema; })))],
    cursor: ['cursor', (0, schema_1.optional)((0, schema_1.string)())],
    errors: ['errors', (0, schema_1.optional)((0, schema_1.array)((0, schema_1.lazy)(function () { return error_1.errorSchema; })))]
});
//# sourceMappingURL=listBreakTypesResponse.js.map