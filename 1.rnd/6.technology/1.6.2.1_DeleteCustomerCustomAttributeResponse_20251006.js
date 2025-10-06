"use strict";
exports.__esModule = true;
exports.deleteCustomerCustomAttributeResponseSchema = void 0;
const schema_1 = require("../schema");
const error_1 = require("./error");
exports.deleteCustomerCustomAttributeResponseSchema = (0, schema_1.object)({ errors: ['errors', (0, schema_1.optional)((0, schema_1.array)((0, schema_1.lazy)(function () { return error_1.errorSchema; })))] });
//# sourceMappingURL=deleteCustomerCustomAttributeResponse.js.map