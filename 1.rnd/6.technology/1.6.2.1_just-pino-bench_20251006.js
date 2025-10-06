'use strict'

const bench = require('fastbench')
const pino = require('../../')
const fs = require('node:fs')
const dest = fs.createWriteStream('/dev/null')
const plog = pino(dest)
delete require.cache[require.resolve('../../')]
const plogDest = require('../../')(pino.destination('/dev/null'))
delete require.cache[require.resolve('../../')]
const plogAsync = require('../../')(pino.destination({ dest: '/dev/null', sync: false }))
const plogChild = plog.child({ a: 'property' })
const plogDestChild = plogDest.child({ a: 'property' })
const plogAsyncChild = plogAsync.child({ a: 'property' })
const plogChildChild = plog.child({ a: 'property' }).child({ sub: 'child' })
const plogDestChildChild = plogDest.child({ a: 'property' }).child({ sub: 'child' })
const plogAsyncChildChild = plogAsync.child({ a: 'property' }).child({ sub: 'child' })

const max = 10

const run = bench([
  function benchPino (cb) {
    for (let i = 0; i < max; i++) {
      plog.info('hello world')
    }
    setImmediate(cb)
  },
  function benchPinoDest (cb) {
    for (let i = 0; i < max; i++) {
      plogDest.info('hello world')
    }
    setImmediate(cb)
  },
  function benchPinoExtreme (cb) {
    for (let i = 0; i < max; i++) {
      plogAsync.info('hello world')
    }
    setImmediate(cb)
  },
  function benchPinoObj (cb) {
    for (let i = 0; i < max; i++) {
      plog.info({ hello: 'world' })
    }
    setImmediate(cb)
  },
  function benchPinoDestObj (cb) {
    for (let i = 0; i < max; i++) {
      plogDest.info({ hello: 'world' })
    }
    setImmediate(cb)
  },
  function benchPinoAsyncObj (cb) {
    for (let i = 0; i < max; i++) {
      plogAsync.info({ hello: 'world' })
    }
    setImmediate(cb)
  },
  function benchPinoChild (cb) {
    for (let i = 0; i < max; i++) {
      plogChild.info({ hello: 'world' })
    }
    setImmediate(cb)
  },
  function benchPinoDestChild (cb) {
    for (let i = 0; i < max; i++) {
      plogDestChild.info({ hello: 'world' })
    }
    setImmediate(cb)
  },
  function benchPinoAsyncChild (cb) {
    for (let i = 0; i < max; i++) {
      plogAsyncChild.info({ hello: 'world' })
    }
    setImmediate(cb)
  },
  function benchPinoChildChild (cb) {
    for (let i = 0; i < max; i++) {
      plogChildChild.info({ hello: 'world' })
    }
    setImmediate(cb)
  },
  function benchPinoDestChildChild (cb) {
    for (let i = 0; i < max; i++) {
      plogDestChildChild.info({ hello: 'world' })
    }
    setImmediate(cb)
  },
  function benchPinoAsyncChildChild (cb) {
    for (let i = 0; i < max; i++) {
      plogAsyncChildChild.info({ hello: 'world' })
    }
    setImmediate(cb)
  },
  function benchPinoChildCreation (cb) {
    const child = plog.child({ a: 'property' })
    for (let i = 0; i < max; i++) {
      child.info({ hello: 'world' })
    }
    setImmediate(cb)
  },
  function benchPinoDestChildCreation (cb) {
    const child = plogDest.child({ a: 'property' })
    for (let i = 0; i < max; i++) {
      child.info({ hello: 'world' })
    }
    setImmediate(cb)
  },
  function benchPinoMulti (cb) {
    for (let i = 0; i < max; i++) {
      plog.info('hello', 'world')
    }
    setImmediate(cb)
  },
  function benchPinoDestMulti (cb) {
    for (let i = 0; i < max; i++) {
      plogDest.info('hello', 'world')
    }
    setImmediate(cb)
  },
  function benchPinoAsyncMulti (cb) {
    for (let i = 0; i < max; i++) {
      plogAsync.info('hello', 'world')
    }
    setImmediate(cb)
  },
  function benchPinoInterpolate (cb) {
    for (let i = 0; i < max; i++) {
      plog.info('hello %s', 'world')
    }
    setImmediate(cb)
  },
  function benchPinoDestInterpolate (cb) {
    for (let i = 0; i < max; i++) {
      plogDest.info('hello %s', 'world')
    }
    setImmediate(cb)
  },
  function benchPinoDestInterpolate (cb) {
    for (let i = 0; i < max; i++) {
      plogDest.info('hello %s', 'world')
    }
    setImmediate(cb)
  },
  function benchPinoInterpolateAll (cb) {
    for (let i = 0; i < max; i++) {
      plog.info('hello %s %j %d', 'world', { obj: true }, 4)
    }
    setImmediate(cb)
  },
  function benchPinoDestInterpolateAll (cb) {
    for (let i = 0; i < max; i++) {
      plogDest.info('hello %s %j %d', 'world', { obj: true }, 4)
    }
    setImmediate(cb)
  },
  function benchPinoAsyncInterpolateAll (cb) {
    for (let i = 0; i < max; i++) {
      plogAsync.info('hello %s %j %d', 'world', { obj: true }, 4)
    }
    setImmediate(cb)
  },
  function benchPinoInterpolateExtra (cb) {
    for (let i = 0; i < max; i++) {
      plog.info('hello %s %j %d', 'world', { obj: true }, 4, { another: 'obj' })
    }
    setImmediate(cb)
  },
  function benchPinoDestInterpolateExtra (cb) {
    for (let i = 0; i < max; i++) {
      plogDest.info('hello %s %j %d', 'world', { obj: true }, 4, { another: 'obj' })
    }
    setImmediate(cb)
  },
  function benchPinoAsyncInterpolateExtra (cb) {
    for (let i = 0; i < max; i++) {
      plogAsync.info('hello %s %j %d', 'world', { obj: true }, 4, { another: 'obj' })
    }
    setImmediate(cb)
  }
], 10000)

run(run)
