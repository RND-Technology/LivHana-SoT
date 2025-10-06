"use strict";
exports.__esModule = true;
exports.businessHoursSchema = void 0;
const schema_1 = require("../schema");
const businessHoursPeriod_1 = require("./businessHoursPeriod");
exports.businessHoursSchema = (0, schema_1.object)({
    periods: [
        'periods',
        (0, schema_1.optional)((0, schema_1.nullable)((0, schema_1.array)((0, schema_1.lazy)(function () { return businessHoursPeriod_1.businessHoursPeriodSchema; })))),
    ]
});
//# sourceMappingURL=businessHours.js.map