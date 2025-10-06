"use strict";
exports.__esModule = true;
exports.searchSubscriptionsRequestSchema = void 0;
const schema_1 = require("../schema");
const searchSubscriptionsQuery_1 = require("./searchSubscriptionsQuery");
exports.searchSubscriptionsRequestSchema = (0, schema_1.object)({
    cursor: ['cursor', (0, schema_1.optional)((0, schema_1.string)())],
    limit: ['limit', (0, schema_1.optional)((0, schema_1.number)())],
    query: ['query', (0, schema_1.optional)((0, schema_1.lazy)(function () { return searchSubscriptionsQuery_1.searchSubscriptionsQuerySchema; }))],
    include: ['include', (0, schema_1.optional)((0, schema_1.array)((0, schema_1.string)()))]
});
//# sourceMappingURL=searchSubscriptionsRequest.js.map