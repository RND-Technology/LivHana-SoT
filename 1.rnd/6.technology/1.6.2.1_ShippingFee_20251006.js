"use strict";
exports.__esModule = true;
exports.shippingFeeSchema = void 0;
const schema_1 = require("../schema");
const money_1 = require("./money");
exports.shippingFeeSchema = (0, schema_1.object)({
    name: ['name', (0, schema_1.optional)((0, schema_1.nullable)((0, schema_1.string)()))],
    charge: ['charge', (0, schema_1.lazy)(function () { return money_1.moneySchema; })]
});
//# sourceMappingURL=shippingFee.js.map