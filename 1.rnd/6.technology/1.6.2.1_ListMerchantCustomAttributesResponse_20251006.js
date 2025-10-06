"use strict";
exports.__esModule = true;
exports.listMerchantCustomAttributesResponseSchema = void 0;
const schema_1 = require("../schema");
const customAttribute_1 = require("./customAttribute");
const error_1 = require("./error");
exports.listMerchantCustomAttributesResponseSchema = (0, schema_1.object)({
    customAttributes: [
        'custom_attributes',
        (0, schema_1.optional)((0, schema_1.array)((0, schema_1.lazy)(function () { return customAttribute_1.customAttributeSchema; }))),
    ],
    cursor: ['cursor', (0, schema_1.optional)((0, schema_1.string)())],
    errors: ['errors', (0, schema_1.optional)((0, schema_1.array)((0, schema_1.lazy)(function () { return error_1.errorSchema; })))]
});
//# sourceMappingURL=listMerchantCustomAttributesResponse.js.map