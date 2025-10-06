"use strict";
exports.__esModule = true;
exports.disableCardResponseSchema = void 0;
const schema_1 = require("../schema");
const card_1 = require("./card");
const error_1 = require("./error");
exports.disableCardResponseSchema = (0, schema_1.object)({
    errors: ['errors', (0, schema_1.optional)((0, schema_1.array)((0, schema_1.lazy)(function () { return error_1.errorSchema; })))],
    card: ['card', (0, schema_1.optional)((0, schema_1.lazy)(function () { return card_1.cardSchema; }))]
});
//# sourceMappingURL=disableCardResponse.js.map