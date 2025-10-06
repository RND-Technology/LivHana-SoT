"use strict";
exports.__esModule = true;
exports.updateItemModifierListsResponseSchema = void 0;
const schema_1 = require("../schema");
const error_1 = require("./error");
exports.updateItemModifierListsResponseSchema = (0, schema_1.object)({
    errors: ['errors', (0, schema_1.optional)((0, schema_1.array)((0, schema_1.lazy)(function () { return error_1.errorSchema; })))],
    updatedAt: ['updated_at', (0, schema_1.optional)((0, schema_1.string)())]
});
//# sourceMappingURL=updateItemModifierListsResponse.js.map