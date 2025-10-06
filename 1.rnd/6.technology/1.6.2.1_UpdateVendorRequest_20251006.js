"use strict";
exports.__esModule = true;
exports.updateVendorRequestSchema = void 0;
const schema_1 = require("../schema");
const vendor_1 = require("./vendor");
exports.updateVendorRequestSchema = (0, schema_1.object)({
    idempotencyKey: ['idempotency_key', (0, schema_1.optional)((0, schema_1.nullable)((0, schema_1.string)()))],
    vendor: ['vendor', (0, schema_1.lazy)(function () { return vendor_1.vendorSchema; })]
});
//# sourceMappingURL=updateVendorRequest.js.map