"use strict";
exports.__esModule = true;
exports.listEmployeesResponseSchema = void 0;
const schema_1 = require("../schema");
const employee_1 = require("./employee");
const error_1 = require("./error");
exports.listEmployeesResponseSchema = (0, schema_1.object)({
    employees: ['employees', (0, schema_1.optional)((0, schema_1.array)((0, schema_1.lazy)(function () { return employee_1.employeeSchema; })))],
    cursor: ['cursor', (0, schema_1.optional)((0, schema_1.string)())],
    errors: ['errors', (0, schema_1.optional)((0, schema_1.array)((0, schema_1.lazy)(function () { return error_1.errorSchema; })))]
});
//# sourceMappingURL=listEmployeesResponse.js.map