"use strict";
exports.__esModule = true;
exports.v1ListOrdersResponseSchema = void 0;
const schema_1 = require("../schema");
const v1Order_1 = require("./v1Order");
exports.v1ListOrdersResponseSchema = (0, schema_1.object)({
    items: ['items', (0, schema_1.optional)((0, schema_1.array)((0, schema_1.lazy)(function () { return v1Order_1.v1OrderSchema; })))]
});
//# sourceMappingURL=v1ListOrdersResponse.js.map