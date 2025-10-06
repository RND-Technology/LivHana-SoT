"use strict";
exports.__esModule = true;
exports.listTeamMemberBookingProfilesResponseSchema = void 0;
const schema_1 = require("../schema");
const error_1 = require("./error");
const teamMemberBookingProfile_1 = require("./teamMemberBookingProfile");
exports.listTeamMemberBookingProfilesResponseSchema = (0, schema_1.object)({
    teamMemberBookingProfiles: [
        'team_member_booking_profiles',
        (0, schema_1.optional)((0, schema_1.array)((0, schema_1.lazy)(function () { return teamMemberBookingProfile_1.teamMemberBookingProfileSchema; }))),
    ],
    cursor: ['cursor', (0, schema_1.optional)((0, schema_1.string)())],
    errors: ['errors', (0, schema_1.optional)((0, schema_1.array)((0, schema_1.lazy)(function () { return error_1.errorSchema; })))]
});
//# sourceMappingURL=listTeamMemberBookingProfilesResponse.js.map