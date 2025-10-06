"use strict";
exports.__esModule = true;
exports.createPaymentResponseSchema = void 0;
const schema_1 = require("../schema");
const error_1 = require("./error");
const payment_1 = require("./payment");
exports.createPaymentResponseSchema = (0, schema_1.object)({
    errors: ['errors', (0, schema_1.optional)((0, schema_1.array)((0, schema_1.lazy)(function () { return error_1.errorSchema; })))],
    payment: ['payment', (0, schema_1.optional)((0, schema_1.lazy)(function () { return payment_1.paymentSchema; }))]
});
//# sourceMappingURL=createPaymentResponse.js.map