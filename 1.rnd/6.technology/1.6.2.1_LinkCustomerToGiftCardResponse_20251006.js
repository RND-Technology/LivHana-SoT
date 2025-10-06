"use strict";
exports.__esModule = true;
exports.linkCustomerToGiftCardResponseSchema = void 0;
const schema_1 = require("../schema");
const error_1 = require("./error");
const giftCard_1 = require("./giftCard");
exports.linkCustomerToGiftCardResponseSchema = (0, schema_1.object)({
    errors: ['errors', (0, schema_1.optional)((0, schema_1.array)((0, schema_1.lazy)(function () { return error_1.errorSchema; })))],
    giftCard: ['gift_card', (0, schema_1.optional)((0, schema_1.lazy)(function () { return giftCard_1.giftCardSchema; }))]
});
//# sourceMappingURL=linkCustomerToGiftCardResponse.js.map