"use strict";
exports.__esModule = true;
exports.chargeResponseSchema = void 0;
const schema_1 = require("../schema");
const error_1 = require("./error");
const transaction_1 = require("./transaction");
exports.chargeResponseSchema = (0, schema_1.object)({
    errors: ['errors', (0, schema_1.optional)((0, schema_1.array)((0, schema_1.lazy)(function () { return error_1.errorSchema; })))],
    transaction: ['transaction', (0, schema_1.optional)((0, schema_1.lazy)(function () { return transaction_1.transactionSchema; }))]
});
//# sourceMappingURL=chargeResponse.js.map