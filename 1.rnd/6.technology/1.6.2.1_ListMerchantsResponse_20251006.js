"use strict";
exports.__esModule = true;
exports.listMerchantsResponseSchema = void 0;
const schema_1 = require("../schema");
const error_1 = require("./error");
const merchant_1 = require("./merchant");
exports.listMerchantsResponseSchema = (0, schema_1.object)({
    errors: ['errors', (0, schema_1.optional)((0, schema_1.array)((0, schema_1.lazy)(function () { return error_1.errorSchema; })))],
    merchant: ['merchant', (0, schema_1.optional)((0, schema_1.array)((0, schema_1.lazy)(function () { return merchant_1.merchantSchema; })))],
    cursor: ['cursor', (0, schema_1.optional)((0, schema_1.number)())]
});
//# sourceMappingURL=listMerchantsResponse.js.map