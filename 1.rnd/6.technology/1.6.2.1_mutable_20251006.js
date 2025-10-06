module.exports = extend

const hasOwnProperty = Object.prototype.hasOwnProperty;

function extend(target) {
    for (let i = 1; i < arguments.length; i++) {
        const source = arguments[i]

        for (const key in source) {
            if (hasOwnProperty.call(source, key)) {
                target[key] = source[key]
            }
        }
    }

    return target
}
