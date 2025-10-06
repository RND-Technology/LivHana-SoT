"use strict";
exports.__esModule = true;
exports.updateWageSettingRequestSchema = void 0;
const schema_1 = require("../schema");
const wageSetting_1 = require("./wageSetting");
exports.updateWageSettingRequestSchema = (0, schema_1.object)({ wageSetting: ['wage_setting', (0, schema_1.lazy)(function () { return wageSetting_1.wageSettingSchema; })] });
//# sourceMappingURL=updateWageSettingRequest.js.map