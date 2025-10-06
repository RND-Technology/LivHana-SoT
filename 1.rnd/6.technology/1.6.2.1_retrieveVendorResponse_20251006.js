"use strict";
exports.__esModule = true;
exports.retrieveVendorResponseSchema = void 0;
const schema_1 = require("../schema");
const error_1 = require("./error");
const vendor_1 = require("./vendor");
exports.retrieveVendorResponseSchema = (0, schema_1.object)({
    errors: ['errors', (0, schema_1.optional)((0, schema_1.array)((0, schema_1.lazy)(function () { return error_1.errorSchema; })))],
    vendor: ['vendor', (0, schema_1.optional)((0, schema_1.lazy)(function () { return vendor_1.vendorSchema; }))]
});
//# sourceMappingURL=retrieveVendorResponse.js.map