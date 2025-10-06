"use strict";
exports.__esModule = true;
exports.updateTeamMemberRequestSchema = void 0;
const schema_1 = require("../schema");
const teamMember_1 = require("./teamMember");
exports.updateTeamMemberRequestSchema = (0, schema_1.object)({ teamMember: ['team_member', (0, schema_1.optional)((0, schema_1.lazy)(function () { return teamMember_1.teamMemberSchema; }))] });
//# sourceMappingURL=updateTeamMemberRequest.js.map