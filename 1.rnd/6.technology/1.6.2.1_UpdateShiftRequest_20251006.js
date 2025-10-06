"use strict";
exports.__esModule = true;
exports.updateShiftRequestSchema = void 0;
const schema_1 = require("../schema");
const shift_1 = require("./shift");
exports.updateShiftRequestSchema = (0, schema_1.object)({
    shift: ['shift', (0, schema_1.lazy)(function () { return shift_1.shiftSchema; })]
});
//# sourceMappingURL=updateShiftRequest.js.map