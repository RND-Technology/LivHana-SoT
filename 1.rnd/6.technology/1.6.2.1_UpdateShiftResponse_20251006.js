"use strict";
exports.__esModule = true;
exports.updateShiftResponseSchema = void 0;
const schema_1 = require("../schema");
const error_1 = require("./error");
const shift_1 = require("./shift");
exports.updateShiftResponseSchema = (0, schema_1.object)({
    shift: ['shift', (0, schema_1.optional)((0, schema_1.lazy)(function () { return shift_1.shiftSchema; }))],
    errors: ['errors', (0, schema_1.optional)((0, schema_1.array)((0, schema_1.lazy)(function () { return error_1.errorSchema; })))]
});
//# sourceMappingURL=updateShiftResponse.js.map