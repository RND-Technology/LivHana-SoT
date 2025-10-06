"use strict";
exports.__esModule = true;
exports.searchAvailabilityResponseSchema = void 0;
const schema_1 = require("../schema");
const availability_1 = require("./availability");
const error_1 = require("./error");
exports.searchAvailabilityResponseSchema = (0, schema_1.object)({
    availabilities: [
        'availabilities',
        (0, schema_1.optional)((0, schema_1.array)((0, schema_1.lazy)(function () { return availability_1.availabilitySchema; }))),
    ],
    errors: ['errors', (0, schema_1.optional)((0, schema_1.array)((0, schema_1.lazy)(function () { return error_1.errorSchema; })))]
});
//# sourceMappingURL=searchAvailabilityResponse.js.map