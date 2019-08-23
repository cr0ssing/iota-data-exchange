/**
 * Wrapper around ntrujs NTRUEncrypt. Provides convenience methods to work with
 * the IOTA Tangle.
 *
 * - Create an NTRU key pair based on an IOTA seed.
 * - Convert a public key to trytes so it can be send over IOTA.
 * - Encrypt to trytes using tryte encoded public key.
 * - Decrypt trytes.
 *
 * @module ntru
 */
import { ntru } from 'ntru';
import { TextDecoder, TextEncoder } from 'util';
// const NTRU = require('ntru');
const IOTA = require('iota.lib.js');

const iota = new IOTA(); // IOTA lib instance without provider for utils only

// Converts trytes into string and handles odd length trytes by appending 9
const iotaFromTrytes = trytes =>
  trytes.length % 2 === 1
    ? iota.utils.fromTrytes(`${trytes}9`)
    : iota.utils.fromTrytes(trytes);

const iotaToTrytes = iota.utils.toTrytes;

/**
 * Converts string to Uint8Array.
 *
 * @param {string} str String to convert
 * @return {UintArray} The byte array that represents the string
 */
function toBytes(str) {
  const utf8Encoder = new TextEncoder();
  const bytes = utf8Encoder.encode(str);

  return bytes;
}

/**
 * Creates an NTRU key pair based on a seed.
 *
 * @function createKeyPair
 * @param {string} seed IOTA seed to generate key pair with
 * @returns {Object} Key pair with private and public keys
 */
export function createKeyPair(seed) {
  const bytes = toBytes(seed);
  const keyPair = ntru.keyPair(); // createKeyWithSeed(bytes);

  return keyPair;
}

/**
 * Converts a Buffer to trytes.
 * First converts to base64 and then to trytes.
 *
 * @function toTrytes
 * @param {Buffer} buffer Buffer to convert
 * @returns {string} Tryte representation of buffer
 */
export function toTrytes(buffer) {
  const trytes = iotaToTrytes(buffer.toString('base64'));

  return trytes;
}
export function toStringTrytes(arr: Uint8Array | Buffer) {
  const decoder = new TextDecoder('utf-8');
  const ba64 = decoder.decode(arr);
  let tmp;
  let rev;

  tmp = new TextDecoder('utf-8').decode(arr); // to UTF-8 text.
  tmp = unescape(encodeURIComponent(tmp)); // to binary-string.
  tmp = btoa(tmp);
  rev = new TextEncoder().encode(tmp); // to Uint8Array.
  rev = rev.buffer; // to ArrayBuffer.
  return ba64;
}
/**
 * Converts a buffer that was converted to trytes by {@link toTrytes}
 * back to a buffer.
 * First converts from trytes to base64 and then to Buffer.
 *
 * @function toTrytes
 * @param {string} trytes Buffer converted to trytes
 * @returns {Buffer} Original buffer
 */
export function fromTrytes(trytes) {
  const buffer = Buffer.from(iotaFromTrytes(trytes), 'base64');

  return buffer;
}

/**
 * Decrypts trytes with NTRU encoded cipher text with private key.
 *
 * @function encrypt
 * @param {string} trytes Trytes to decrypt
 * @param {Buffer} privateKey Private key
 * @returns {string} Plain text string
 */
export async function decrypt(trytes, privateKey) {
  const buffer = fromTrytes(trytes);
  const decrypted = await ntru.decrypt(buffer, privateKey);

  return decrypted.toString();
}

/**
 * Encrypts string with public key.
 *
 * @function encrypt
 * @param {string} str String to encrypt
 * @param {string} publicKey Tryte encoded public key
 * @returns {string} Tryte encoded NTRU encrypted MAM data
 */
export async function encrypt(str, publicKey) {
  if (str.length > 106) {
    throw new Error(
      `Cannot encrypt string ${str} because it is longer than 106 characters`
    );
  }

  const publicKeyBuffer = fromTrytes(publicKey);
  const plainText = Buffer.from(str, 'utf8');
  const encrypted = await ntru.encrypt(plainText, publicKeyBuffer);
  const encryptedTrytes = toTrytes(encrypted);

  return encryptedTrytes;
}

// Need to call `NTRU.createKey` before creating a key pair or encrypting or
// decrypting, otherwise it does not work. See
// https://github.com/IDWMaster/ntrujs/issues/6.

// ntru.createKey();

// exports = {
//   toBytes,
//   createKeyPair,
//   toTrytes,
//   fromTrytes,
//   encrypt,
//   decrypt,
// };
