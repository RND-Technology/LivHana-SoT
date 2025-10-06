"use strict";
exports.__esModule = true;
exports.getTerminalCheckoutResponseSchema = void 0;
const schema_1 = require("../schema");
const error_1 = require("./error");
const terminalCheckout_1 = require("./terminalCheckout");
exports.getTerminalCheckoutResponseSchema = (0, schema_1.object)({
    errors: ['errors', (0, schema_1.optional)((0, schema_1.array)((0, schema_1.lazy)(function () { return error_1.errorSchema; })))],
    checkout: ['checkout', (0, schema_1.optional)((0, schema_1.lazy)(function () { return terminalCheckout_1.terminalCheckoutSchema; }))]
});
//# sourceMappingURL=getTerminalCheckoutResponse.js.map