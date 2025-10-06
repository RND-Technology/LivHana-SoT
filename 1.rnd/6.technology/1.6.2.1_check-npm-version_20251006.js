const { execSync } = require('child_process')
const pico = require('picocolors')

try {
  const version = parseInt(execSync('npm -v'))
  if (version <= 6) {
    process.stderr.write(
      pico.red(
        'Update npm or call ' +
          pico.yellow('npx browserslist@latest --update-db') +
          '\n'
      )
    )
    process.exit(1)
  }
  // eslint-disable-next-line no-unused-vars
} catch (e) {}
