"use strict";
exports.__esModule = true;
exports.loyaltyEventQuerySchema = void 0;
const schema_1 = require("../schema");
const loyaltyEventFilter_1 = require("./loyaltyEventFilter");
exports.loyaltyEventQuerySchema = (0, schema_1.object)({
    filter: ['filter', (0, schema_1.optional)((0, schema_1.lazy)(function () { return loyaltyEventFilter_1.loyaltyEventFilterSchema; }))]
});
//# sourceMappingURL=loyaltyEventQuery.js.map