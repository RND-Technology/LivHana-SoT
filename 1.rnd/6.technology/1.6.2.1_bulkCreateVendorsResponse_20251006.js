"use strict";
exports.__esModule = true;
exports.bulkCreateVendorsResponseSchema = void 0;
const schema_1 = require("../schema");
const createVendorResponse_1 = require("./createVendorResponse");
const error_1 = require("./error");
exports.bulkCreateVendorsResponseSchema = (0, schema_1.object)({
    errors: ['errors', (0, schema_1.optional)((0, schema_1.array)((0, schema_1.lazy)(function () { return error_1.errorSchema; })))],
    responses: [
        'responses',
        (0, schema_1.optional)((0, schema_1.dict)((0, schema_1.lazy)(function () { return createVendorResponse_1.createVendorResponseSchema; }))),
    ]
});
//# sourceMappingURL=bulkCreateVendorsResponse.js.map