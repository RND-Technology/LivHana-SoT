"use strict";
exports.__esModule = true;
exports.deleteCustomerResponseSchema = void 0;
const schema_1 = require("../schema");
const error_1 = require("./error");
exports.deleteCustomerResponseSchema = (0, schema_1.object)({ errors: ['errors', (0, schema_1.optional)((0, schema_1.array)((0, schema_1.lazy)(function () { return error_1.errorSchema; })))] });
//# sourceMappingURL=deleteCustomerResponse.js.map