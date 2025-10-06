"use strict";
exports.__esModule = true;
exports.processingFeeSchema = void 0;
const schema_1 = require("../schema");
const money_1 = require("./money");
exports.processingFeeSchema = (0, schema_1.object)({
    effectiveAt: ['effective_at', (0, schema_1.optional)((0, schema_1.nullable)((0, schema_1.string)()))],
    type: ['type', (0, schema_1.optional)((0, schema_1.nullable)((0, schema_1.string)()))],
    amountMoney: ['amount_money', (0, schema_1.optional)((0, schema_1.lazy)(function () { return money_1.moneySchema; }))]
});
//# sourceMappingURL=processingFee.js.map