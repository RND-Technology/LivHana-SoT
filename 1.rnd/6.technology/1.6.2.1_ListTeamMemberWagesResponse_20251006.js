"use strict";
exports.__esModule = true;
exports.listTeamMemberWagesResponseSchema = void 0;
const schema_1 = require("../schema");
const error_1 = require("./error");
const teamMemberWage_1 = require("./teamMemberWage");
exports.listTeamMemberWagesResponseSchema = (0, schema_1.object)({
    teamMemberWages: [
        'team_member_wages',
        (0, schema_1.optional)((0, schema_1.array)((0, schema_1.lazy)(function () { return teamMemberWage_1.teamMemberWageSchema; }))),
    ],
    cursor: ['cursor', (0, schema_1.optional)((0, schema_1.string)())],
    errors: ['errors', (0, schema_1.optional)((0, schema_1.array)((0, schema_1.lazy)(function () { return error_1.errorSchema; })))]
});
//# sourceMappingURL=listTeamMemberWagesResponse.js.map