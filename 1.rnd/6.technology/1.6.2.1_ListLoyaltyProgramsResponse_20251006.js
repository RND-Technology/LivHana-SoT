"use strict";
exports.__esModule = true;
exports.listLoyaltyProgramsResponseSchema = void 0;
const schema_1 = require("../schema");
const error_1 = require("./error");
const loyaltyProgram_1 = require("./loyaltyProgram");
exports.listLoyaltyProgramsResponseSchema = (0, schema_1.object)({
    errors: ['errors', (0, schema_1.optional)((0, schema_1.array)((0, schema_1.lazy)(function () { return error_1.errorSchema; })))],
    programs: ['programs', (0, schema_1.optional)((0, schema_1.array)((0, schema_1.lazy)(function () { return loyaltyProgram_1.loyaltyProgramSchema; })))]
});
//# sourceMappingURL=listLoyaltyProgramsResponse.js.map