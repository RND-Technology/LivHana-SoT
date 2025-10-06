"use strict";
exports.__esModule = true;
exports.upsertSnippetRequestSchema = void 0;
const schema_1 = require("../schema");
const snippet_1 = require("./snippet");
exports.upsertSnippetRequestSchema = (0, schema_1.object)({
    snippet: ['snippet', (0, schema_1.lazy)(function () { return snippet_1.snippetSchema; })]
});
//# sourceMappingURL=upsertSnippetRequest.js.map