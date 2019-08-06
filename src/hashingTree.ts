import * as converter from '@iota/converter';
import Curl from '@iota/curl';
import DateTag from './DateTag';
import { asciiToTrits, binStrToTrits } from './ternaryStringOperations';

/**
 * Hashes a value
 * TODO add tests
 * @param start start of the hashing
 * @param add Trits that are beeing used for hashing
 */
export function hash(start: Int8Array, add: Int8Array) {
  const split = add.length / 3;
  let input = start;
  let outTrits = new Int8Array(Curl.HASH_LENGTH);
  for (let index = 0; index < add.length; index++) {
    if (index === add.length - 1) {
      const val = converter.trytes(outTrits);
    }
    outTrits = hashCurl(input, add.slice(index, index + 1));
    input = outTrits;
  }
  return outTrits;
}
/**
 * TODO Add Describtion
 * @param lenght
 * @param trits
 */
export function hashCurl(trits: Int8Array, tritsAdd: Int8Array): Int8Array {
  const curl: Curl = new Curl();
  const outTrits = new Int8Array(Curl.HASH_LENGTH);

  curl.initialize();
  // kerl.absorb(new Int8Array(Kerl.HASH_LENGTH), 0, Kerl.HASH_LENGTH);
  curl.absorb(trits, 0, trits.length);
  curl.absorb(tritsAdd, 0, tritsAdd.length);
  curl.squeeze(outTrits, 0, Curl.HASH_LENGTH);
  return outTrits;
}
/**
 * Get the has for a Datetag
 * @param secret global secret
 * @param date DateTag
 */
export function hashFromDatetag(secret: string, date: DateTag) {
  const tryteSecret = converter.asciiToTrytes(secret);
  const tritsSecret = converter.trits(tryteSecret);
  const dateStr = date
    .toBinStr()
    .split('')
    .map(e => parseInt(e, 10));
  const dateTrits = Int8Array.of(...dateStr);
  const hashVal = hash(tritsSecret, dateTrits);
  return converter.trytes(hashVal);
}
/**
 * Gets Hash of secret and binary string
 * @param secret global secret
 * @param binStr binary string
 */
export function hashFromBinStr(secret: string, binStr: string) {
  const secretTrits = asciiToTrits(secret);
  const binTrits = binStrToTrits(binStr.replace(/X/g, ''));
  const hashVal = hash(secretTrits, binTrits);
  return converter.trytes(hashVal);
}
