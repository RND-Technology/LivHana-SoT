"use strict";
exports.__esModule = true;
exports.bulkDeleteMerchantCustomAttributesRequestSchema = void 0;
const schema_1 = require("../schema");
const bulkDeleteMerchantCustomAttributesRequestMerchantCustomAttributeDeleteRequest_1 = require("./bulkDeleteMerchantCustomAttributesRequestMerchantCustomAttributeDeleteRequest");
exports.bulkDeleteMerchantCustomAttributesRequestSchema = (0, schema_1.object)({
    values: [
        'values',
        (0, schema_1.dict)((0, schema_1.lazy)(function () {
            return bulkDeleteMerchantCustomAttributesRequestMerchantCustomAttributeDeleteRequest_1.bulkDeleteMerchantCustomAttributesRequestMerchantCustomAttributeDeleteRequestSchema;
        })),
    ]
});
//# sourceMappingURL=bulkDeleteMerchantCustomAttributesRequest.js.map