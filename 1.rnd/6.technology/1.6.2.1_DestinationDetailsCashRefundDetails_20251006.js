"use strict";
exports.__esModule = true;
exports.destinationDetailsCashRefundDetailsSchema = void 0;
const schema_1 = require("../schema");
const money_1 = require("./money");
exports.destinationDetailsCashRefundDetailsSchema = (0, schema_1.object)({
    sellerSuppliedMoney: ['seller_supplied_money', (0, schema_1.lazy)(function () { return money_1.moneySchema; })],
    changeBackMoney: ['change_back_money', (0, schema_1.optional)((0, schema_1.lazy)(function () { return money_1.moneySchema; }))]
});
//# sourceMappingURL=destinationDetailsCashRefundDetails.js.map