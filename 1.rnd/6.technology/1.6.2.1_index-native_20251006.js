import { getRandomBytesAsync } from 'expo-random'
import { urlAlphabet } from '../url-alphabet/index.js'
const random = getRandomBytesAsync
const customAlphabet = (alphabet, defaultSize = 21) => {
  const mask = (2 << (31 - Math.clz32((alphabet.length - 1) | 1))) - 1
  const step = Math.ceil((1.6 * mask * defaultSize) / alphabet.length)
  const tick = (id, size = defaultSize) =>
    random(step).then(bytes => {
      let i = step
      while (i--) {
        id += alphabet[bytes[i] & mask] || ''
        if (id.length >= size) return id
      }
      return tick(id, size)
    })
  return size => tick('', size)
}
const nanoid = (size = 21) =>
  random((size |= 0)).then(bytes => {
    let id = ''
    while (size--) {
      id += urlAlphabet[bytes[size] & 63]
    }
    return id
  })
export { nanoid, customAlphabet, random }
