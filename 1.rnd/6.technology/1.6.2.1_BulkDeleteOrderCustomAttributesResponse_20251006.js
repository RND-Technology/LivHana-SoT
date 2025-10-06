"use strict";
exports.__esModule = true;
exports.bulkDeleteOrderCustomAttributesResponseSchema = void 0;
const schema_1 = require("../schema");
const deleteOrderCustomAttributeResponse_1 = require("./deleteOrderCustomAttributeResponse");
const error_1 = require("./error");
exports.bulkDeleteOrderCustomAttributesResponseSchema = (0, schema_1.object)({
    errors: ['errors', (0, schema_1.optional)((0, schema_1.array)((0, schema_1.lazy)(function () { return error_1.errorSchema; })))],
    values: [
        'values',
        (0, schema_1.dict)((0, schema_1.lazy)(function () { return deleteOrderCustomAttributeResponse_1.deleteOrderCustomAttributeResponseSchema; })),
    ]
});
//# sourceMappingURL=bulkDeleteOrderCustomAttributesResponse.js.map