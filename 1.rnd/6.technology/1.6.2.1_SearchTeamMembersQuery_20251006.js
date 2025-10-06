"use strict";
exports.__esModule = true;
exports.searchTeamMembersQuerySchema = void 0;
const schema_1 = require("../schema");
const searchTeamMembersFilter_1 = require("./searchTeamMembersFilter");
exports.searchTeamMembersQuerySchema = (0, schema_1.object)({ filter: ['filter', (0, schema_1.optional)((0, schema_1.lazy)(function () { return searchTeamMembersFilter_1.searchTeamMembersFilterSchema; }))] });
//# sourceMappingURL=searchTeamMembersQuery.js.map