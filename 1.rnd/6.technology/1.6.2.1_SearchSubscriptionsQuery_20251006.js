"use strict";
exports.__esModule = true;
exports.searchSubscriptionsQuerySchema = void 0;
const schema_1 = require("../schema");
const searchSubscriptionsFilter_1 = require("./searchSubscriptionsFilter");
exports.searchSubscriptionsQuerySchema = (0, schema_1.object)({ filter: ['filter', (0, schema_1.optional)((0, schema_1.lazy)(function () { return searchSubscriptionsFilter_1.searchSubscriptionsFilterSchema; }))] });
//# sourceMappingURL=searchSubscriptionsQuery.js.map