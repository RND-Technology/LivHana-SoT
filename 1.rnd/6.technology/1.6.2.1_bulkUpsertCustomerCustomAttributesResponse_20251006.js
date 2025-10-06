"use strict";
exports.__esModule = true;
exports.bulkUpsertCustomerCustomAttributesResponseSchema = void 0;
const schema_1 = require("../schema");
const bulkUpsertCustomerCustomAttributesResponseCustomerCustomAttributeUpsertResponse_1 = require("./bulkUpsertCustomerCustomAttributesResponseCustomerCustomAttributeUpsertResponse");
const error_1 = require("./error");
exports.bulkUpsertCustomerCustomAttributesResponseSchema = (0, schema_1.object)({
    values: [
        'values',
        (0, schema_1.optional)((0, schema_1.dict)((0, schema_1.lazy)(function () {
            return bulkUpsertCustomerCustomAttributesResponseCustomerCustomAttributeUpsertResponse_1.bulkUpsertCustomerCustomAttributesResponseCustomerCustomAttributeUpsertResponseSchema;
        }))),
    ],
    errors: ['errors', (0, schema_1.optional)((0, schema_1.array)((0, schema_1.lazy)(function () { return error_1.errorSchema; })))]
});
//# sourceMappingURL=bulkUpsertCustomerCustomAttributesResponse.js.map