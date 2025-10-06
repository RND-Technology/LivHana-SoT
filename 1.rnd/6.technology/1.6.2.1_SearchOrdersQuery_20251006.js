"use strict";
exports.__esModule = true;
exports.searchOrdersQuerySchema = void 0;
const schema_1 = require("../schema");
const searchOrdersFilter_1 = require("./searchOrdersFilter");
const searchOrdersSort_1 = require("./searchOrdersSort");
exports.searchOrdersQuerySchema = (0, schema_1.object)({
    filter: ['filter', (0, schema_1.optional)((0, schema_1.lazy)(function () { return searchOrdersFilter_1.searchOrdersFilterSchema; }))],
    sort: ['sort', (0, schema_1.optional)((0, schema_1.lazy)(function () { return searchOrdersSort_1.searchOrdersSortSchema; }))]
});
//# sourceMappingURL=searchOrdersQuery.js.map