"use strict";
exports.__esModule = true;
exports.searchVendorsRequestSchema = void 0;
const schema_1 = require("../schema");
const searchVendorsRequestFilter_1 = require("./searchVendorsRequestFilter");
const searchVendorsRequestSort_1 = require("./searchVendorsRequestSort");
exports.searchVendorsRequestSchema = (0, schema_1.object)({
    filter: ['filter', (0, schema_1.optional)((0, schema_1.lazy)(function () { return searchVendorsRequestFilter_1.searchVendorsRequestFilterSchema; }))],
    sort: ['sort', (0, schema_1.optional)((0, schema_1.lazy)(function () { return searchVendorsRequestSort_1.searchVendorsRequestSortSchema; }))],
    cursor: ['cursor', (0, schema_1.optional)((0, schema_1.string)())]
});
//# sourceMappingURL=searchVendorsRequest.js.map