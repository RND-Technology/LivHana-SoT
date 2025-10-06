"use strict";
exports.__esModule = true;
exports.updatePaymentRequestSchema = void 0;
const schema_1 = require("../schema");
const payment_1 = require("./payment");
exports.updatePaymentRequestSchema = (0, schema_1.object)({
    payment: ['payment', (0, schema_1.optional)((0, schema_1.lazy)(function () { return payment_1.paymentSchema; }))],
    idempotencyKey: ['idempotency_key', (0, schema_1.string)()]
});
//# sourceMappingURL=updatePaymentRequest.js.map