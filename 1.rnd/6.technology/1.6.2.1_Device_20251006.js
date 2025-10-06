"use strict";
exports.__esModule = true;
exports.deviceSchema = void 0;
const schema_1 = require("../schema");
const component_1 = require("./component");
const deviceAttributes_1 = require("./deviceAttributes");
const deviceStatus_1 = require("./deviceStatus");
exports.deviceSchema = (0, schema_1.object)({
    id: ['id', (0, schema_1.optional)((0, schema_1.string)())],
    attributes: ['attributes', (0, schema_1.lazy)(function () { return deviceAttributes_1.deviceAttributesSchema; })],
    components: [
        'components',
        (0, schema_1.optional)((0, schema_1.nullable)((0, schema_1.array)((0, schema_1.lazy)(function () { return component_1.componentSchema; })))),
    ],
    status: ['status', (0, schema_1.optional)((0, schema_1.lazy)(function () { return deviceStatus_1.deviceStatusSchema; }))]
});
//# sourceMappingURL=device.js.map