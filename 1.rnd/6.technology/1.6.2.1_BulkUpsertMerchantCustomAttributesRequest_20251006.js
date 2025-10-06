"use strict";
exports.__esModule = true;
exports.bulkUpsertMerchantCustomAttributesRequestSchema = void 0;
const schema_1 = require("../schema");
const bulkUpsertMerchantCustomAttributesRequestMerchantCustomAttributeUpsertRequest_1 = require("./bulkUpsertMerchantCustomAttributesRequestMerchantCustomAttributeUpsertRequest");
exports.bulkUpsertMerchantCustomAttributesRequestSchema = (0, schema_1.object)({
    values: [
        'values',
        (0, schema_1.dict)((0, schema_1.lazy)(function () {
            return bulkUpsertMerchantCustomAttributesRequestMerchantCustomAttributeUpsertRequest_1.bulkUpsertMerchantCustomAttributesRequestMerchantCustomAttributeUpsertRequestSchema;
        })),
    ]
});
//# sourceMappingURL=bulkUpsertMerchantCustomAttributesRequest.js.map