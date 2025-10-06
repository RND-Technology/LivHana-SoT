"use strict";
exports.__esModule = true;
exports.batchUpsertCatalogObjectsRequestSchema = void 0;
const schema_1 = require("../schema");
const catalogObjectBatch_1 = require("./catalogObjectBatch");
exports.batchUpsertCatalogObjectsRequestSchema = (0, schema_1.object)({
    idempotencyKey: ['idempotency_key', (0, schema_1.string)()],
    batches: ['batches', (0, schema_1.array)((0, schema_1.lazy)(function () { return catalogObjectBatch_1.catalogObjectBatchSchema; }))]
});
//# sourceMappingURL=batchUpsertCatalogObjectsRequest.js.map