"use strict";
exports.__esModule = true;
exports.checkoutLocationSettingsSchema = void 0;
const schema_1 = require("../schema");
const checkoutLocationSettingsBranding_1 = require("./checkoutLocationSettingsBranding");
const checkoutLocationSettingsCoupons_1 = require("./checkoutLocationSettingsCoupons");
const checkoutLocationSettingsPolicy_1 = require("./checkoutLocationSettingsPolicy");
const checkoutLocationSettingsTipping_1 = require("./checkoutLocationSettingsTipping");
exports.checkoutLocationSettingsSchema = (0, schema_1.object)({
    locationId: ['location_id', (0, schema_1.optional)((0, schema_1.nullable)((0, schema_1.string)()))],
    customerNotesEnabled: [
        'customer_notes_enabled',
        (0, schema_1.optional)((0, schema_1.nullable)((0, schema_1.boolean)())),
    ],
    policies: [
        'policies',
        (0, schema_1.optional)((0, schema_1.nullable)((0, schema_1.array)((0, schema_1.lazy)(function () { return checkoutLocationSettingsPolicy_1.checkoutLocationSettingsPolicySchema; })))),
    ],
    branding: [
        'branding',
        (0, schema_1.optional)((0, schema_1.lazy)(function () { return checkoutLocationSettingsBranding_1.checkoutLocationSettingsBrandingSchema; })),
    ],
    tipping: [
        'tipping',
        (0, schema_1.optional)((0, schema_1.lazy)(function () { return checkoutLocationSettingsTipping_1.checkoutLocationSettingsTippingSchema; })),
    ],
    coupons: [
        'coupons',
        (0, schema_1.optional)((0, schema_1.lazy)(function () { return checkoutLocationSettingsCoupons_1.checkoutLocationSettingsCouponsSchema; })),
    ],
    updatedAt: ['updated_at', (0, schema_1.optional)((0, schema_1.string)())]
});
//# sourceMappingURL=checkoutLocationSettings.js.map