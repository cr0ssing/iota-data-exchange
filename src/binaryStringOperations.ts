import DateTag from './DateTag';
import { EMonth } from './typings/Date';

/**
 * Extends a binary string to a given length
 * @param s binary string of a number
 * @param l desired lenght of the binary string
 */
export function buildStrBin(s: string, l: number): string {
  if (s.length > l) {
    throw new Error();
  }
  let res = '';
  const lenght = l;
  const diff = lenght > s.length ? lenght - s.length : 0;
  for (let i = 0; i < diff; i++) {
    res += '0';
  }
  res += s;
  return res;
}
/**
 * Generate a given string n-times
 * @param n number of repetitions
 * @param val string to be repeated
 */
export function appendStrVals(n: number, val: string) {
  let res = '';
  for (let i = 0; i < n; i++) {
    res = res + val;
  }
  return res;
}

/**
 * Calculates the diff of two parts of a Datetag e.g. months
 * @param s
 * @param e
 * @param prop
 */
export function getDiff(
  s: DateTag | null,
  e: DateTag | null,
  prop: string
): number[] {
  // FIXME Why is the EMonth fixed? It should be flexible.
  const startEl = s !== null ? s[prop] : EMonth.min;
  const endEl = e !== null ? e[prop] : EMonth.max;
  let list = [];
  for (let index = startEl; index <= endEl; index++) {
    list = [...list, index];
  }
  return list;
}
