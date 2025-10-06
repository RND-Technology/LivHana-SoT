"use strict";
exports.__esModule = true;
exports.cloneOrderResponseSchema = void 0;
const schema_1 = require("../schema");
const error_1 = require("./error");
const order_1 = require("./order");
exports.cloneOrderResponseSchema = (0, schema_1.object)({
    order: ['order', (0, schema_1.optional)((0, schema_1.lazy)(function () { return order_1.orderSchema; }))],
    errors: ['errors', (0, schema_1.optional)((0, schema_1.array)((0, schema_1.lazy)(function () { return error_1.errorSchema; })))]
});
//# sourceMappingURL=cloneOrderResponse.js.map