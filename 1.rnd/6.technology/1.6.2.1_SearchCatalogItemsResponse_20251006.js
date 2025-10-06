"use strict";
exports.__esModule = true;
exports.searchCatalogItemsResponseSchema = void 0;
const schema_1 = require("../schema");
const catalogObject_1 = require("./catalogObject");
const error_1 = require("./error");
exports.searchCatalogItemsResponseSchema = (0, schema_1.object)({
    errors: ['errors', (0, schema_1.optional)((0, schema_1.array)((0, schema_1.lazy)(function () { return error_1.errorSchema; })))],
    items: ['items', (0, schema_1.optional)((0, schema_1.array)((0, schema_1.lazy)(function () { return catalogObject_1.catalogObjectSchema; })))],
    cursor: ['cursor', (0, schema_1.optional)((0, schema_1.string)())],
    matchedVariationIds: ['matched_variation_ids', (0, schema_1.optional)((0, schema_1.array)((0, schema_1.string)()))]
});
//# sourceMappingURL=searchCatalogItemsResponse.js.map