"use strict";
exports.__esModule = true;
exports.bulkCreateTeamMembersRequestSchema = void 0;
const schema_1 = require("../schema");
const createTeamMemberRequest_1 = require("./createTeamMemberRequest");
exports.bulkCreateTeamMembersRequestSchema = (0, schema_1.object)({
    teamMembers: [
        'team_members',
        (0, schema_1.dict)((0, schema_1.lazy)(function () { return createTeamMemberRequest_1.createTeamMemberRequestSchema; })),
    ]
});
//# sourceMappingURL=bulkCreateTeamMembersRequest.js.map