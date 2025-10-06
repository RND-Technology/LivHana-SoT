"use strict";
exports.__esModule = true;
exports.createLoyaltyAccountRequestSchema = void 0;
const schema_1 = require("../schema");
const loyaltyAccount_1 = require("./loyaltyAccount");
exports.createLoyaltyAccountRequestSchema = (0, schema_1.object)({
    loyaltyAccount: ['loyalty_account', (0, schema_1.lazy)(function () { return loyaltyAccount_1.loyaltyAccountSchema; })],
    idempotencyKey: ['idempotency_key', (0, schema_1.string)()]
});
//# sourceMappingURL=createLoyaltyAccountRequest.js.map