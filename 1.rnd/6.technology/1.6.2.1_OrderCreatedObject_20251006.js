"use strict";
exports.__esModule = true;
exports.orderCreatedObjectSchema = void 0;
const schema_1 = require("../schema");
const orderCreated_1 = require("./orderCreated");
exports.orderCreatedObjectSchema = (0, schema_1.object)({
    orderCreated: ['order_created', (0, schema_1.optional)((0, schema_1.lazy)(function () { return orderCreated_1.orderCreatedSchema; }))]
});
//# sourceMappingURL=orderCreatedObject.js.map