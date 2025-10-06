"use strict";
exports.__esModule = true;
exports.orderLineItemPricingBlocklistsSchema = void 0;
const schema_1 = require("../schema");
const orderLineItemPricingBlocklistsBlockedDiscount_1 = require("./orderLineItemPricingBlocklistsBlockedDiscount");
const orderLineItemPricingBlocklistsBlockedTax_1 = require("./orderLineItemPricingBlocklistsBlockedTax");
exports.orderLineItemPricingBlocklistsSchema = (0, schema_1.object)({
    blockedDiscounts: [
        'blocked_discounts',
        (0, schema_1.optional)((0, schema_1.nullable)((0, schema_1.array)((0, schema_1.lazy)(function () { return orderLineItemPricingBlocklistsBlockedDiscount_1.orderLineItemPricingBlocklistsBlockedDiscountSchema; })))),
    ],
    blockedTaxes: [
        'blocked_taxes',
        (0, schema_1.optional)((0, schema_1.nullable)((0, schema_1.array)((0, schema_1.lazy)(function () { return orderLineItemPricingBlocklistsBlockedTax_1.orderLineItemPricingBlocklistsBlockedTaxSchema; })))),
    ]
});
//# sourceMappingURL=orderLineItemPricingBlocklists.js.map