"use strict";
exports.__esModule = true;
exports.calculateOrderResponseSchema = void 0;
const schema_1 = require("../schema");
const error_1 = require("./error");
const order_1 = require("./order");
exports.calculateOrderResponseSchema = (0, schema_1.object)({
    order: ['order', (0, schema_1.optional)((0, schema_1.lazy)(function () { return order_1.orderSchema; }))],
    errors: ['errors', (0, schema_1.optional)((0, schema_1.array)((0, schema_1.lazy)(function () { return error_1.errorSchema; })))]
});
//# sourceMappingURL=calculateOrderResponse.js.map