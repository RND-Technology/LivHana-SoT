"use strict";
exports.__esModule = true;
exports.searchInvoicesResponseSchema = void 0;
const schema_1 = require("../schema");
const error_1 = require("./error");
const invoice_1 = require("./invoice");
exports.searchInvoicesResponseSchema = (0, schema_1.object)({
    invoices: ['invoices', (0, schema_1.optional)((0, schema_1.array)((0, schema_1.lazy)(function () { return invoice_1.invoiceSchema; })))],
    cursor: ['cursor', (0, schema_1.optional)((0, schema_1.string)())],
    errors: ['errors', (0, schema_1.optional)((0, schema_1.array)((0, schema_1.lazy)(function () { return error_1.errorSchema; })))]
});
//# sourceMappingURL=searchInvoicesResponse.js.map