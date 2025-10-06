"use strict";
exports.__esModule = true;
exports.signatureOptionsSchema = void 0;
const schema_1 = require("../schema");
const signatureImage_1 = require("./signatureImage");
exports.signatureOptionsSchema = (0, schema_1.object)({
    title: ['title', (0, schema_1.string)()],
    body: ['body', (0, schema_1.string)()],
    signature: ['signature', (0, schema_1.optional)((0, schema_1.array)((0, schema_1.lazy)(function () { return signatureImage_1.signatureImageSchema; })))]
});
//# sourceMappingURL=signatureOptions.js.map