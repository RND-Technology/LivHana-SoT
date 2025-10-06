"use strict";
exports.__esModule = true;
exports.retrieveInventoryTransferResponseSchema = void 0;
const schema_1 = require("../schema");
const error_1 = require("./error");
const inventoryTransfer_1 = require("./inventoryTransfer");
exports.retrieveInventoryTransferResponseSchema = (0, schema_1.object)({
    errors: ['errors', (0, schema_1.optional)((0, schema_1.array)((0, schema_1.lazy)(function () { return error_1.errorSchema; })))],
    transfer: ['transfer', (0, schema_1.optional)((0, schema_1.lazy)(function () { return inventoryTransfer_1.inventoryTransferSchema; }))]
});
//# sourceMappingURL=retrieveInventoryTransferResponse.js.map