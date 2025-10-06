"use strict";
exports.__esModule = true;
exports.listCashDrawerShiftsResponseSchema = void 0;
const schema_1 = require("../schema");
const cashDrawerShiftSummary_1 = require("./cashDrawerShiftSummary");
const error_1 = require("./error");
exports.listCashDrawerShiftsResponseSchema = (0, schema_1.object)({
    cursor: ['cursor', (0, schema_1.optional)((0, schema_1.string)())],
    errors: ['errors', (0, schema_1.optional)((0, schema_1.array)((0, schema_1.lazy)(function () { return error_1.errorSchema; })))],
    cashDrawerShifts: [
        'cash_drawer_shifts',
        (0, schema_1.optional)((0, schema_1.array)((0, schema_1.lazy)(function () { return cashDrawerShiftSummary_1.cashDrawerShiftSummarySchema; }))),
    ]
});
//# sourceMappingURL=listCashDrawerShiftsResponse.js.map