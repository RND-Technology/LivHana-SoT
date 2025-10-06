"use strict";
exports.__esModule = true;
exports.createLocationResponseSchema = void 0;
const schema_1 = require("../schema");
const error_1 = require("./error");
const location_1 = require("./location");
exports.createLocationResponseSchema = (0, schema_1.object)({
    errors: ['errors', (0, schema_1.optional)((0, schema_1.array)((0, schema_1.lazy)(function () { return error_1.errorSchema; })))],
    location: ['location', (0, schema_1.optional)((0, schema_1.lazy)(function () { return location_1.locationSchema; }))]
});
//# sourceMappingURL=createLocationResponse.js.map