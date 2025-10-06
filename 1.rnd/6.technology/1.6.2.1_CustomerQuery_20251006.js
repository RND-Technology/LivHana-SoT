"use strict";
exports.__esModule = true;
exports.customerQuerySchema = void 0;
const schema_1 = require("../schema");
const customerFilter_1 = require("./customerFilter");
const customerSort_1 = require("./customerSort");
exports.customerQuerySchema = (0, schema_1.object)({
    filter: ['filter', (0, schema_1.optional)((0, schema_1.lazy)(function () { return customerFilter_1.customerFilterSchema; }))],
    sort: ['sort', (0, schema_1.optional)((0, schema_1.lazy)(function () { return customerSort_1.customerSortSchema; }))]
});
//# sourceMappingURL=customerQuery.js.map