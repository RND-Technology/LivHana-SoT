"use strict";
exports.__esModule = true;
exports.terminalRefundQuerySchema = void 0;
const schema_1 = require("../schema");
const terminalRefundQueryFilter_1 = require("./terminalRefundQueryFilter");
const terminalRefundQuerySort_1 = require("./terminalRefundQuerySort");
exports.terminalRefundQuerySchema = (0, schema_1.object)({
    filter: ['filter', (0, schema_1.optional)((0, schema_1.lazy)(function () { return terminalRefundQueryFilter_1.terminalRefundQueryFilterSchema; }))],
    sort: ['sort', (0, schema_1.optional)((0, schema_1.lazy)(function () { return terminalRefundQuerySort_1.terminalRefundQuerySortSchema; }))]
});
//# sourceMappingURL=terminalRefundQuery.js.map