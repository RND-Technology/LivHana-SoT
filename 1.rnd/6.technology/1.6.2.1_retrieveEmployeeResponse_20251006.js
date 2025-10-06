"use strict";
exports.__esModule = true;
exports.retrieveEmployeeResponseSchema = void 0;
const schema_1 = require("../schema");
const employee_1 = require("./employee");
const error_1 = require("./error");
exports.retrieveEmployeeResponseSchema = (0, schema_1.object)({
    employee: ['employee', (0, schema_1.optional)((0, schema_1.lazy)(function () { return employee_1.employeeSchema; }))],
    errors: ['errors', (0, schema_1.optional)((0, schema_1.array)((0, schema_1.lazy)(function () { return error_1.errorSchema; })))]
});
//# sourceMappingURL=retrieveEmployeeResponse.js.map