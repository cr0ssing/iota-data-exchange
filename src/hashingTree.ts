import { Function } from '@babel/types';
import * as converter from '@iota/converter';
import Curl from '@iota/curl';
import * as kerl from '@iota/kerl';
import { binStrToTernStr } from './ternaryStringOperations';

/**
 * Calculates the hash for a given path and global secret
 * @param a array of path
 * @param startVal global secret
 * @param hashFunc hashing function
 */
export function hashBinArray(a: string, startVal: string, tryte: boolean) {
  let result;
  if (tryte) {
    result = startVal;
  } else {
    result = converter.asciiToTrytes(startVal);
  }
  const ternary = binStrToTernStr(a);
  for (const iterator of a) {
    const tern = converter.asciiToTrytes(iterator);
    result = hash(result + tern);
  }
  return result;
}

export function hash(data: string, rounds: number = 81) {
  return converter.trytes(
    hashKerl(
      rounds, // Removed the || statement with 81 as 81 is now default
      converter.trits(data.slice())
    ).slice()
  );
}
export function hashKerl(rounds: number, ...keys): Int8Array {
  const curl: Curl = new Curl(rounds);
  const key: Int8Array = new Int8Array(Curl.HASH_LENGTH);
  curl.initialize();
  keys.map(k => curl.absorb(k, 0, Curl.HASH_LENGTH));
  curl.squeeze(key, 0, Curl.HASH_LENGTH);
  return key;
}
