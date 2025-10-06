const pump = require('./index')

const rs = require('fs').createReadStream('/dev/random')
const ws = require('fs').createWriteStream('/dev/null')

const toHex = function () {
  const reverse = new (require('stream').Transform)()

  reverse._transform = function (chunk, enc, callback) {
    reverse.push(chunk.toString('hex'))
    callback()
  }

  return reverse
}

let wsClosed = false
let rsClosed = false
let callbackCalled = false

const check = function () {
  if (wsClosed && rsClosed && callbackCalled) {
    console.log('test-node.js passes')
    clearTimeout(timeout)
  }
}

ws.on('close', function () {
  wsClosed = true
  check()
})

rs.on('close', function () {
  rsClosed = true
  check()
})

const res = pump(rs, toHex(), toHex(), toHex(), ws, function () {
  callbackCalled = true
  check()
})

if (res !== ws) {
  throw new Error('should return last stream')
}

setTimeout(function () {
  rs.destroy()
}, 1000)

var timeout = setTimeout(function () {
  throw new Error('timeout')
}, 5000)
