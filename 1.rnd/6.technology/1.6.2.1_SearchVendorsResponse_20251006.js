"use strict";
exports.__esModule = true;
exports.searchVendorsResponseSchema = void 0;
const schema_1 = require("../schema");
const error_1 = require("./error");
const vendor_1 = require("./vendor");
exports.searchVendorsResponseSchema = (0, schema_1.object)({
    errors: ['errors', (0, schema_1.optional)((0, schema_1.array)((0, schema_1.lazy)(function () { return error_1.errorSchema; })))],
    vendors: ['vendors', (0, schema_1.optional)((0, schema_1.array)((0, schema_1.lazy)(function () { return vendor_1.vendorSchema; })))],
    cursor: ['cursor', (0, schema_1.optional)((0, schema_1.string)())]
});
//# sourceMappingURL=searchVendorsResponse.js.map