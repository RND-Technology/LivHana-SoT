"use strict";
exports.__esModule = true;
exports.listLoyaltyPromotionsResponseSchema = void 0;
const schema_1 = require("../schema");
const error_1 = require("./error");
const loyaltyPromotion_1 = require("./loyaltyPromotion");
exports.listLoyaltyPromotionsResponseSchema = (0, schema_1.object)({
    errors: ['errors', (0, schema_1.optional)((0, schema_1.array)((0, schema_1.lazy)(function () { return error_1.errorSchema; })))],
    loyaltyPromotions: [
        'loyalty_promotions',
        (0, schema_1.optional)((0, schema_1.array)((0, schema_1.lazy)(function () { return loyaltyPromotion_1.loyaltyPromotionSchema; }))),
    ],
    cursor: ['cursor', (0, schema_1.optional)((0, schema_1.string)())]
});
//# sourceMappingURL=listLoyaltyPromotionsResponse.js.map