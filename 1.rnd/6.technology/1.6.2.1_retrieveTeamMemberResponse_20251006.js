"use strict";
exports.__esModule = true;
exports.retrieveTeamMemberResponseSchema = void 0;
const schema_1 = require("../schema");
const error_1 = require("./error");
const teamMember_1 = require("./teamMember");
exports.retrieveTeamMemberResponseSchema = (0, schema_1.object)({
    teamMember: ['team_member', (0, schema_1.optional)((0, schema_1.lazy)(function () { return teamMember_1.teamMemberSchema; }))],
    errors: ['errors', (0, schema_1.optional)((0, schema_1.array)((0, schema_1.lazy)(function () { return error_1.errorSchema; })))]
});
//# sourceMappingURL=retrieveTeamMemberResponse.js.map