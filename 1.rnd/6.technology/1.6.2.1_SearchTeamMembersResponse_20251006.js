"use strict";
exports.__esModule = true;
exports.searchTeamMembersResponseSchema = void 0;
const schema_1 = require("../schema");
const error_1 = require("./error");
const teamMember_1 = require("./teamMember");
exports.searchTeamMembersResponseSchema = (0, schema_1.object)({
    teamMembers: [
        'team_members',
        (0, schema_1.optional)((0, schema_1.array)((0, schema_1.lazy)(function () { return teamMember_1.teamMemberSchema; }))),
    ],
    cursor: ['cursor', (0, schema_1.optional)((0, schema_1.string)())],
    errors: ['errors', (0, schema_1.optional)((0, schema_1.array)((0, schema_1.lazy)(function () { return error_1.errorSchema; })))]
});
//# sourceMappingURL=searchTeamMembersResponse.js.map