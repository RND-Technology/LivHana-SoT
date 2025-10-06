"use strict";
exports.__esModule = true;
exports.getDeviceResponseSchema = void 0;
const schema_1 = require("../schema");
const device_1 = require("./device");
const error_1 = require("./error");
exports.getDeviceResponseSchema = (0, schema_1.object)({
    errors: ['errors', (0, schema_1.optional)((0, schema_1.array)((0, schema_1.lazy)(function () { return error_1.errorSchema; })))],
    device: ['device', (0, schema_1.optional)((0, schema_1.lazy)(function () { return device_1.deviceSchema; }))]
});
//# sourceMappingURL=getDeviceResponse.js.map