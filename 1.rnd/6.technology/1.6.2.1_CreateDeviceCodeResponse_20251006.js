"use strict";
exports.__esModule = true;
exports.createDeviceCodeResponseSchema = void 0;
const schema_1 = require("../schema");
const deviceCode_1 = require("./deviceCode");
const error_1 = require("./error");
exports.createDeviceCodeResponseSchema = (0, schema_1.object)({
    errors: ['errors', (0, schema_1.optional)((0, schema_1.array)((0, schema_1.lazy)(function () { return error_1.errorSchema; })))],
    deviceCode: ['device_code', (0, schema_1.optional)((0, schema_1.lazy)(function () { return deviceCode_1.deviceCodeSchema; }))]
});
//# sourceMappingURL=createDeviceCodeResponse.js.map