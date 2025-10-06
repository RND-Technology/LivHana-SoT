"use strict";
exports.__esModule = true;
exports.retrieveInventoryChangesResponseSchema = void 0;
const schema_1 = require("../schema");
const error_1 = require("./error");
const inventoryChange_1 = require("./inventoryChange");
exports.retrieveInventoryChangesResponseSchema = (0, schema_1.object)({
    errors: ['errors', (0, schema_1.optional)((0, schema_1.array)((0, schema_1.lazy)(function () { return error_1.errorSchema; })))],
    changes: ['changes', (0, schema_1.optional)((0, schema_1.array)((0, schema_1.lazy)(function () { return inventoryChange_1.inventoryChangeSchema; })))],
    cursor: ['cursor', (0, schema_1.optional)((0, schema_1.string)())]
});
//# sourceMappingURL=retrieveInventoryChangesResponse.js.map