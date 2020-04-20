const RNGetRandomValues = require('react-native').NativeModules.RNGetRandomValues
const base64Decode = require('fast-base64-decode')

class TypeMismatchError extends Error {}
class QuotaExceededError extends Error {}

/**
 * @param {Int8Array|Uint8Array|Int16Array|Uint16Array|Int32Array|Uint32Array|Uint8ClampedArray} array
 */
function getRandomValues (array) {
  if (!(array instanceof Int8Array || array instanceof Uint8Array || array instanceof Int16Array || array instanceof Uint16Array || array instanceof Int32Array || array instanceof Uint32Array || array instanceof Uint8ClampedArray)) {
    throw new TypeMismatchError('Expected an integer array')
  }

  if (array.byteLength > 65536) {
    throw new QuotaExceededError('Can only request a maximum of 65536 bytes')
  }
  
  // Calling RNGetRandomValues.getRandomBase64 in debug mode leads to the error
  // "Calling synchronous methods on native modules is not supported in Chrome".
  // So in that specific case we fall back to just using Math.random.
  if (__DEV__) {
    for (var i = 0, r; i < array.length; i++) {
      if ((i & 0x03) === 0) r = Math.random() * 0x100000000;
      array[i] = (r >>> ((i & 0x03) << 3)) & 0xff;
    }

    return array;
  }

  base64Decode(RNGetRandomValues.getRandomBase64(array.byteLength), new Uint8Array(array.buffer, array.byteOffset, array.byteLength))

  return array
}

if (typeof global.crypto !== 'object') {
  global.crypto = {}
}

if (typeof global.crypto.getRandomValues !== 'function') {
  global.crypto.getRandomValues = getRandomValues
}
