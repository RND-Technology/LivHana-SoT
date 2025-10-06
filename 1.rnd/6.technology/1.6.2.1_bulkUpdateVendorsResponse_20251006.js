"use strict";
exports.__esModule = true;
exports.bulkUpdateVendorsResponseSchema = void 0;
const schema_1 = require("../schema");
const error_1 = require("./error");
const updateVendorResponse_1 = require("./updateVendorResponse");
exports.bulkUpdateVendorsResponseSchema = (0, schema_1.object)({
    errors: ['errors', (0, schema_1.optional)((0, schema_1.array)((0, schema_1.lazy)(function () { return error_1.errorSchema; })))],
    responses: [
        'responses',
        (0, schema_1.optional)((0, schema_1.dict)((0, schema_1.lazy)(function () { return updateVendorResponse_1.updateVendorResponseSchema; }))),
    ]
});
//# sourceMappingURL=bulkUpdateVendorsResponse.js.map