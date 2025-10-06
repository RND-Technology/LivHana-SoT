"use strict";
exports.__esModule = true;
exports.bulkUpsertLocationCustomAttributesResponseSchema = void 0;
const schema_1 = require("../schema");
const bulkUpsertLocationCustomAttributesResponseLocationCustomAttributeUpsertResponse_1 = require("./bulkUpsertLocationCustomAttributesResponseLocationCustomAttributeUpsertResponse");
const error_1 = require("./error");
exports.bulkUpsertLocationCustomAttributesResponseSchema = (0, schema_1.object)({
    values: [
        'values',
        (0, schema_1.optional)((0, schema_1.dict)((0, schema_1.lazy)(function () {
            return bulkUpsertLocationCustomAttributesResponseLocationCustomAttributeUpsertResponse_1.bulkUpsertLocationCustomAttributesResponseLocationCustomAttributeUpsertResponseSchema;
        }))),
    ],
    errors: ['errors', (0, schema_1.optional)((0, schema_1.array)((0, schema_1.lazy)(function () { return error_1.errorSchema; })))]
});
//# sourceMappingURL=bulkUpsertLocationCustomAttributesResponse.js.map