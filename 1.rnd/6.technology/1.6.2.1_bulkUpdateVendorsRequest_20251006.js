"use strict";
exports.__esModule = true;
exports.bulkUpdateVendorsRequestSchema = void 0;
const schema_1 = require("../schema");
const updateVendorRequest_1 = require("./updateVendorRequest");
exports.bulkUpdateVendorsRequestSchema = (0, schema_1.object)({ vendors: ['vendors', (0, schema_1.dict)((0, schema_1.lazy)(function () { return updateVendorRequest_1.updateVendorRequestSchema; }))] });
//# sourceMappingURL=bulkUpdateVendorsRequest.js.map