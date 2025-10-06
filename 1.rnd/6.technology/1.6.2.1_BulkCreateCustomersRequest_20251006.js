"use strict";
exports.__esModule = true;
exports.bulkCreateCustomersRequestSchema = void 0;
const schema_1 = require("../schema");
const bulkCreateCustomerData_1 = require("./bulkCreateCustomerData");
exports.bulkCreateCustomersRequestSchema = (0, schema_1.object)({ customers: ['customers', (0, schema_1.dict)((0, schema_1.lazy)(function () { return bulkCreateCustomerData_1.bulkCreateCustomerDataSchema; }))] });
//# sourceMappingURL=bulkCreateCustomersRequest.js.map