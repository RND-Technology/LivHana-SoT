"use strict";
exports.__esModule = true;
exports.payOrderResponseSchema = void 0;
const schema_1 = require("../schema");
const error_1 = require("./error");
const order_1 = require("./order");
exports.payOrderResponseSchema = (0, schema_1.object)({
    errors: ['errors', (0, schema_1.optional)((0, schema_1.array)((0, schema_1.lazy)(function () { return error_1.errorSchema; })))],
    order: ['order', (0, schema_1.optional)((0, schema_1.lazy)(function () { return order_1.orderSchema; }))]
});
//# sourceMappingURL=payOrderResponse.js.map