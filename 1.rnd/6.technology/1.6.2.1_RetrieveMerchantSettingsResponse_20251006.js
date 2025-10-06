"use strict";
exports.__esModule = true;
exports.retrieveMerchantSettingsResponseSchema = void 0;
const schema_1 = require("../schema");
const checkoutMerchantSettings_1 = require("./checkoutMerchantSettings");
const error_1 = require("./error");
exports.retrieveMerchantSettingsResponseSchema = (0, schema_1.object)({
    errors: ['errors', (0, schema_1.optional)((0, schema_1.array)((0, schema_1.lazy)(function () { return error_1.errorSchema; })))],
    merchantSettings: [
        'merchant_settings',
        (0, schema_1.optional)((0, schema_1.lazy)(function () { return checkoutMerchantSettings_1.checkoutMerchantSettingsSchema; })),
    ]
});
//# sourceMappingURL=retrieveMerchantSettingsResponse.js.map