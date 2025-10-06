"use strict";
exports.__esModule = true;
exports.createCheckoutResponseSchema = void 0;
const schema_1 = require("../schema");
const checkout_1 = require("./checkout");
const error_1 = require("./error");
exports.createCheckoutResponseSchema = (0, schema_1.object)({
    checkout: ['checkout', (0, schema_1.optional)((0, schema_1.lazy)(function () { return checkout_1.checkoutSchema; }))],
    errors: ['errors', (0, schema_1.optional)((0, schema_1.array)((0, schema_1.lazy)(function () { return error_1.errorSchema; })))]
});
//# sourceMappingURL=createCheckoutResponse.js.map