"use strict";
exports.__esModule = true;
exports.createTerminalCheckoutRequestSchema = void 0;
const schema_1 = require("../schema");
const terminalCheckout_1 = require("./terminalCheckout");
exports.createTerminalCheckoutRequestSchema = (0, schema_1.object)({
    idempotencyKey: ['idempotency_key', (0, schema_1.string)()],
    checkout: ['checkout', (0, schema_1.lazy)(function () { return terminalCheckout_1.terminalCheckoutSchema; })]
});
//# sourceMappingURL=createTerminalCheckoutRequest.js.map