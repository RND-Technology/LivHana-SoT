"use strict";
exports.__esModule = true;
exports.retrieveCashDrawerShiftResponseSchema = void 0;
const schema_1 = require("../schema");
const cashDrawerShift_1 = require("./cashDrawerShift");
const error_1 = require("./error");
exports.retrieveCashDrawerShiftResponseSchema = (0, schema_1.object)({
    cashDrawerShift: [
        'cash_drawer_shift',
        (0, schema_1.optional)((0, schema_1.lazy)(function () { return cashDrawerShift_1.cashDrawerShiftSchema; })),
    ],
    errors: ['errors', (0, schema_1.optional)((0, schema_1.array)((0, schema_1.lazy)(function () { return error_1.errorSchema; })))]
});
//# sourceMappingURL=retrieveCashDrawerShiftResponse.js.map