"use strict";
exports.__esModule = true;
exports.searchTerminalActionsResponseSchema = void 0;
const schema_1 = require("../schema");
const error_1 = require("./error");
const terminalAction_1 = require("./terminalAction");
exports.searchTerminalActionsResponseSchema = (0, schema_1.object)({
    errors: ['errors', (0, schema_1.optional)((0, schema_1.array)((0, schema_1.lazy)(function () { return error_1.errorSchema; })))],
    action: ['action', (0, schema_1.optional)((0, schema_1.array)((0, schema_1.lazy)(function () { return terminalAction_1.terminalActionSchema; })))],
    cursor: ['cursor', (0, schema_1.optional)((0, schema_1.string)())]
});
//# sourceMappingURL=searchTerminalActionsResponse.js.map