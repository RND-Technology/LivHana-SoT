"use strict";
exports.__esModule = true;
exports.listCustomerGroupsResponseSchema = void 0;
const schema_1 = require("../schema");
const customerGroup_1 = require("./customerGroup");
const error_1 = require("./error");
exports.listCustomerGroupsResponseSchema = (0, schema_1.object)({
    errors: ['errors', (0, schema_1.optional)((0, schema_1.array)((0, schema_1.lazy)(function () { return error_1.errorSchema; })))],
    groups: ['groups', (0, schema_1.optional)((0, schema_1.array)((0, schema_1.lazy)(function () { return customerGroup_1.customerGroupSchema; })))],
    cursor: ['cursor', (0, schema_1.optional)((0, schema_1.string)())]
});
//# sourceMappingURL=listCustomerGroupsResponse.js.map