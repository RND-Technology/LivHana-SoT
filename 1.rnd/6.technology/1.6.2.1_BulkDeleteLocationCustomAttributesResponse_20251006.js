"use strict";
exports.__esModule = true;
exports.bulkDeleteLocationCustomAttributesResponseSchema = void 0;
const schema_1 = require("../schema");
const bulkDeleteLocationCustomAttributesResponseLocationCustomAttributeDeleteResponse_1 = require("./bulkDeleteLocationCustomAttributesResponseLocationCustomAttributeDeleteResponse");
const error_1 = require("./error");
exports.bulkDeleteLocationCustomAttributesResponseSchema = (0, schema_1.object)({
    values: [
        'values',
        (0, schema_1.dict)((0, schema_1.lazy)(function () {
            return bulkDeleteLocationCustomAttributesResponseLocationCustomAttributeDeleteResponse_1.bulkDeleteLocationCustomAttributesResponseLocationCustomAttributeDeleteResponseSchema;
        })),
    ],
    errors: ['errors', (0, schema_1.optional)((0, schema_1.array)((0, schema_1.lazy)(function () { return error_1.errorSchema; })))]
});
//# sourceMappingURL=bulkDeleteLocationCustomAttributesResponse.js.map