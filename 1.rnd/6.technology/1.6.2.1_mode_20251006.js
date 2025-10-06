module.exports = isexe
isexe.sync = sync

const fs = require('fs')

function isexe (path, options, cb) {
  fs.stat(path, function (er, stat) {
    cb(er, er ? false : checkStat(stat, options))
  })
}

function sync (path, options) {
  return checkStat(fs.statSync(path), options)
}

function checkStat (stat, options) {
  return stat.isFile() && checkMode(stat, options)
}

function checkMode (stat, options) {
  const mod = stat.mode
  const uid = stat.uid
  const gid = stat.gid

  const myUid = options.uid !== undefined ?
    options.uid : process.getuid && process.getuid()
  const myGid = options.gid !== undefined ?
    options.gid : process.getgid && process.getgid()

  const u = parseInt('100', 8)
  const g = parseInt('010', 8)
  const o = parseInt('001', 8)
  const ug = u | g

  const ret = (mod & o) ||
    (mod & g) && gid === myGid ||
    (mod & u) && uid === myUid ||
    (mod & ug) && myUid === 0

  return ret
}
