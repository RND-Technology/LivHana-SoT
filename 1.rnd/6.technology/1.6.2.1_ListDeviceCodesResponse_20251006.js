"use strict";
exports.__esModule = true;
exports.listDeviceCodesResponseSchema = void 0;
const schema_1 = require("../schema");
const deviceCode_1 = require("./deviceCode");
const error_1 = require("./error");
exports.listDeviceCodesResponseSchema = (0, schema_1.object)({
    errors: ['errors', (0, schema_1.optional)((0, schema_1.array)((0, schema_1.lazy)(function () { return error_1.errorSchema; })))],
    deviceCodes: [
        'device_codes',
        (0, schema_1.optional)((0, schema_1.array)((0, schema_1.lazy)(function () { return deviceCode_1.deviceCodeSchema; }))),
    ],
    cursor: ['cursor', (0, schema_1.optional)((0, schema_1.string)())]
});
//# sourceMappingURL=listDeviceCodesResponse.js.map