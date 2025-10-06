"use strict";
exports.__esModule = true;
exports.bulkUpsertMerchantCustomAttributesResponseMerchantCustomAttributeUpsertResponseSchema = void 0;
const schema_1 = require("../schema");
const customAttribute_1 = require("./customAttribute");
const error_1 = require("./error");
exports.bulkUpsertMerchantCustomAttributesResponseMerchantCustomAttributeUpsertResponseSchema = (0, schema_1.object)({
    merchantId: ['merchant_id', (0, schema_1.optional)((0, schema_1.string)())],
    customAttribute: [
        'custom_attribute',
        (0, schema_1.optional)((0, schema_1.lazy)(function () { return customAttribute_1.customAttributeSchema; })),
    ],
    errors: ['errors', (0, schema_1.optional)((0, schema_1.array)((0, schema_1.lazy)(function () { return error_1.errorSchema; })))]
});
//# sourceMappingURL=bulkUpsertMerchantCustomAttributesResponseMerchantCustomAttributeUpsertResponse.js.map