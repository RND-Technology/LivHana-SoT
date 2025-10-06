"use strict";
exports.__esModule = true;
exports.createMobileAuthorizationCodeResponseSchema = void 0;
const schema_1 = require("../schema");
const error_1 = require("./error");
exports.createMobileAuthorizationCodeResponseSchema = (0, schema_1.object)({
    authorizationCode: ['authorization_code', (0, schema_1.optional)((0, schema_1.string)())],
    expiresAt: ['expires_at', (0, schema_1.optional)((0, schema_1.string)())],
    errors: ['errors', (0, schema_1.optional)((0, schema_1.array)((0, schema_1.lazy)(function () { return error_1.errorSchema; })))]
});
//# sourceMappingURL=createMobileAuthorizationCodeResponse.js.map