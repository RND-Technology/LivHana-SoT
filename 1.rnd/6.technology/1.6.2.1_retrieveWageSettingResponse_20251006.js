"use strict";
exports.__esModule = true;
exports.retrieveWageSettingResponseSchema = void 0;
const schema_1 = require("../schema");
const error_1 = require("./error");
const wageSetting_1 = require("./wageSetting");
exports.retrieveWageSettingResponseSchema = (0, schema_1.object)({
    wageSetting: ['wage_setting', (0, schema_1.optional)((0, schema_1.lazy)(function () { return wageSetting_1.wageSettingSchema; }))],
    errors: ['errors', (0, schema_1.optional)((0, schema_1.array)((0, schema_1.lazy)(function () { return error_1.errorSchema; })))]
});
//# sourceMappingURL=retrieveWageSettingResponse.js.map