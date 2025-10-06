"use strict";
exports.__esModule = true;
exports.searchLoyaltyAccountsResponseSchema = void 0;
const schema_1 = require("../schema");
const error_1 = require("./error");
const loyaltyAccount_1 = require("./loyaltyAccount");
exports.searchLoyaltyAccountsResponseSchema = (0, schema_1.object)({
    errors: ['errors', (0, schema_1.optional)((0, schema_1.array)((0, schema_1.lazy)(function () { return error_1.errorSchema; })))],
    loyaltyAccounts: [
        'loyalty_accounts',
        (0, schema_1.optional)((0, schema_1.array)((0, schema_1.lazy)(function () { return loyaltyAccount_1.loyaltyAccountSchema; }))),
    ],
    cursor: ['cursor', (0, schema_1.optional)((0, schema_1.string)())]
});
//# sourceMappingURL=searchLoyaltyAccountsResponse.js.map