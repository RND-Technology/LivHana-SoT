const bench = require('fastbench')
const utilFormat = require('util').format
const quickFormat = require('./')

const run = bench([
  function util(cb) {
    utilFormat('%s %j %d', 'a', {a: {x: 1}}, 1)
    setImmediate(cb)
  },
  function quick(cb) {
    quickFormat('%s %j %d', 'a', [{a: {x: 1}}, 1], null)
    setImmediate(cb)
  },
  function utilWithTailObj(cb) {
    utilFormat('hello %s %j %d', 'world', {obj: true}, 4, {another: 'obj'})
    setImmediate(cb)
  },
  function quickWithTailObj(cb) {
    quickFormat('hello %s %j %d', 'world', [{obj: true}, 4, {another: 'obj'}], null)
    setImmediate(cb)
  }
], 100000)

run(run)
