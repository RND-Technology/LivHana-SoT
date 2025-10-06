"use strict";
exports.__esModule = true;
exports.bulkUpdateTeamMembersRequestSchema = void 0;
const schema_1 = require("../schema");
const updateTeamMemberRequest_1 = require("./updateTeamMemberRequest");
exports.bulkUpdateTeamMembersRequestSchema = (0, schema_1.object)({
    teamMembers: [
        'team_members',
        (0, schema_1.dict)((0, schema_1.lazy)(function () { return updateTeamMemberRequest_1.updateTeamMemberRequestSchema; })),
    ]
});
//# sourceMappingURL=bulkUpdateTeamMembersRequest.js.map