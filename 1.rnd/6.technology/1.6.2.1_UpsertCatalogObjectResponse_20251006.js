"use strict";
exports.__esModule = true;
exports.upsertCatalogObjectResponseSchema = void 0;
const schema_1 = require("../schema");
const catalogIdMapping_1 = require("./catalogIdMapping");
const catalogObject_1 = require("./catalogObject");
const error_1 = require("./error");
exports.upsertCatalogObjectResponseSchema = (0, schema_1.object)({
    errors: ['errors', (0, schema_1.optional)((0, schema_1.array)((0, schema_1.lazy)(function () { return error_1.errorSchema; })))],
    catalogObject: [
        'catalog_object',
        (0, schema_1.optional)((0, schema_1.lazy)(function () { return catalogObject_1.catalogObjectSchema; })),
    ],
    idMappings: [
        'id_mappings',
        (0, schema_1.optional)((0, schema_1.array)((0, schema_1.lazy)(function () { return catalogIdMapping_1.catalogIdMappingSchema; }))),
    ]
});
//# sourceMappingURL=upsertCatalogObjectResponse.js.map