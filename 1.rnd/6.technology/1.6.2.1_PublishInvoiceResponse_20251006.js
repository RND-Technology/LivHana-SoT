"use strict";
exports.__esModule = true;
exports.publishInvoiceResponseSchema = void 0;
const schema_1 = require("../schema");
const error_1 = require("./error");
const invoice_1 = require("./invoice");
exports.publishInvoiceResponseSchema = (0, schema_1.object)({
    invoice: ['invoice', (0, schema_1.optional)((0, schema_1.lazy)(function () { return invoice_1.invoiceSchema; }))],
    errors: ['errors', (0, schema_1.optional)((0, schema_1.array)((0, schema_1.lazy)(function () { return error_1.errorSchema; })))]
});
//# sourceMappingURL=publishInvoiceResponse.js.map