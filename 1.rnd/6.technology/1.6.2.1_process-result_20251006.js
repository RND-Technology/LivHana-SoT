const objectify = require('./objectifier')

module.exports = function processResult(result) {
  if (console && console.warn) {
    result.warnings().forEach(warn => {
      const source = warn.plugin || 'PostCSS'
      console.warn(source + ': ' + warn.text)
    })
  }
  return objectify(result.root)
}
