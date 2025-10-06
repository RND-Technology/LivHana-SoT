"use strict";
exports.__esModule = true;
exports.snippetResponseSchema = void 0;
const schema_1 = require("../schema");
const error_1 = require("./error");
const snippet_1 = require("./snippet");
exports.snippetResponseSchema = (0, schema_1.object)({
    errors: ['errors', (0, schema_1.optional)((0, schema_1.array)((0, schema_1.lazy)(function () { return error_1.errorSchema; })))],
    snippet: ['snippet', (0, schema_1.optional)((0, schema_1.lazy)(function () { return snippet_1.snippetSchema; }))]
});
//# sourceMappingURL=snippetResponse.js.map