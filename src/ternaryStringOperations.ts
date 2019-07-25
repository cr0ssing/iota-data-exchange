import * as converter from '@iota/converter';
import { appendStrVals } from './binaryStringOperations';
/**
 * fill a binary string with -1 values and convert it into a ternary string
 * @param s binary string
 * @returns ternary string
 */
export function binStrToTernStr(s: string): string {
  const sTrits = binToNumberArray(s);
  const sFilled = fillBinStr(sTrits);
  const trits = Int8Array.from(sFilled);

  return converter.trytes(trits);
}
/**
 * Appends -1 values to a binary string
 * @param s string to be extended
 *
 * @returns string with -1 values at the end
 */
export function fillBinStr(s: number[]): number[] {
  const missing = s.length % 3;
  const toBeAdded = missing > 0 ? 3 - missing : 0;

  return [...s, ...Array(toBeAdded).fill(-1)];
}
/**
 * Converts a binary string to an array of numbers
 * @param s binary string
 */
export function binToNumberArray(s: string) {
  return s.split('').map(e => parseInt(e, 10));
}
