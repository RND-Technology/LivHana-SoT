"use strict";

const jsc = require("jsverify");
const refute = require("@sinonjs/referee-sinon").refute;

const functionName = require("./function-name");

describe("function-name", function () {
    it("should return empty string if func is falsy", function () {
        jsc.assertForall("falsy", function (fn) {
            return functionName(fn) === "";
        });
    });

    it("should use displayName by default", function () {
        jsc.assertForall("nestring", function (displayName) {
            const fn = { displayName: displayName };

            return functionName(fn) === fn.displayName;
        });
    });

    it("should use name if displayName is not available", function () {
        jsc.assertForall("nestring", function (name) {
            const fn = { name: name };

            return functionName(fn) === fn.name;
        });
    });

    it("should fallback to string parsing", function () {
        jsc.assertForall("nat", function (naturalNumber) {
            const name = `fn${naturalNumber}`;
            const fn = {
                toString: function () {
                    return `\nfunction ${name}`;
                },
            };

            return functionName(fn) === name;
        });
    });

    it("should not fail when a name cannot be found", function () {
        refute.exception(function () {
            const fn = {
                toString: function () {
                    return "\nfunction (";
                },
            };

            functionName(fn);
        });
    });

    it("should not fail when toString is undefined", function () {
        refute.exception(function () {
            functionName(Object.create(null));
        });
    });

    it("should not fail when toString throws", function () {
        refute.exception(function () {
            let fn;
            try {
                // eslint-disable-next-line no-eval
                fn = eval("(function*() {})")().constructor;
            } catch (e) {
                // env doesn't support generators
                return;
            }

            functionName(fn);
        });
    });
});
