"use strict";
exports.__esModule = true;
exports.catalogInfoResponseSchema = void 0;
const schema_1 = require("../schema");
const catalogInfoResponseLimits_1 = require("./catalogInfoResponseLimits");
const error_1 = require("./error");
const standardUnitDescriptionGroup_1 = require("./standardUnitDescriptionGroup");
exports.catalogInfoResponseSchema = (0, schema_1.object)({
    errors: ['errors', (0, schema_1.optional)((0, schema_1.array)((0, schema_1.lazy)(function () { return error_1.errorSchema; })))],
    limits: ['limits', (0, schema_1.optional)((0, schema_1.lazy)(function () { return catalogInfoResponseLimits_1.catalogInfoResponseLimitsSchema; }))],
    standardUnitDescriptionGroup: [
        'standard_unit_description_group',
        (0, schema_1.optional)((0, schema_1.lazy)(function () { return standardUnitDescriptionGroup_1.standardUnitDescriptionGroupSchema; })),
    ]
});
//# sourceMappingURL=catalogInfoResponse.js.map