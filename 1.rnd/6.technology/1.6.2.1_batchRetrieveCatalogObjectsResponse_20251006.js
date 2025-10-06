"use strict";
exports.__esModule = true;
exports.batchRetrieveCatalogObjectsResponseSchema = void 0;
const schema_1 = require("../schema");
const catalogObject_1 = require("./catalogObject");
const error_1 = require("./error");
exports.batchRetrieveCatalogObjectsResponseSchema = (0, schema_1.object)({
    errors: ['errors', (0, schema_1.optional)((0, schema_1.array)((0, schema_1.lazy)(function () { return error_1.errorSchema; })))],
    objects: ['objects', (0, schema_1.optional)((0, schema_1.array)((0, schema_1.lazy)(function () { return catalogObject_1.catalogObjectSchema; })))],
    relatedObjects: [
        'related_objects',
        (0, schema_1.optional)((0, schema_1.array)((0, schema_1.lazy)(function () { return catalogObject_1.catalogObjectSchema; }))),
    ]
});
//# sourceMappingURL=batchRetrieveCatalogObjectsResponse.js.map