"use strict";
exports.__esModule = true;
exports.createLocationRequestSchema = void 0;
const schema_1 = require("../schema");
const location_1 = require("./location");
exports.createLocationRequestSchema = (0, schema_1.object)({ location: ['location', (0, schema_1.optional)((0, schema_1.lazy)(function () { return location_1.locationSchema; }))] });
//# sourceMappingURL=createLocationRequest.js.map