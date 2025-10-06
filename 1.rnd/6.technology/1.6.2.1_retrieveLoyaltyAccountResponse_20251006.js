"use strict";
exports.__esModule = true;
exports.retrieveLoyaltyAccountResponseSchema = void 0;
const schema_1 = require("../schema");
const error_1 = require("./error");
const loyaltyAccount_1 = require("./loyaltyAccount");
exports.retrieveLoyaltyAccountResponseSchema = (0, schema_1.object)({
    errors: ['errors', (0, schema_1.optional)((0, schema_1.array)((0, schema_1.lazy)(function () { return error_1.errorSchema; })))],
    loyaltyAccount: [
        'loyalty_account',
        (0, schema_1.optional)((0, schema_1.lazy)(function () { return loyaltyAccount_1.loyaltyAccountSchema; })),
    ]
});
//# sourceMappingURL=retrieveLoyaltyAccountResponse.js.map