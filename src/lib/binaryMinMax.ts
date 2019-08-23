/**
 * calculate the min number that can be represented
 * @param s binary string
 * @param o number of replaced digits at the end
 */
export function getMin(s: string, o: number): [number, string] {
  let res = '';
  const e = s.substr(0, s.length - o);
  // console.log(e)
  for (let i = 0; i < s.length; i++) {
    if (e[i]) {
      // console.log(s[i])
      res += e[i];
    } else {
      // console.log("0")
      res += '0';
    }
  }
  const val = parseInt(res, 2);
  // console.log(`MIN - input: ${s} short: ${e} output: ${res} val: ${val}`)
  return [val, res];
}
/**
 * calculate the max number that can be represented
 * @param s binary string
 * @param o number of replaced digits at the end
 */
export function getMax(s: string, o: number): [number, string] {
  let res = '';
  const e = s.substr(0, s.length - o);
  for (let i = 0; i < s.length; i++) {
    if (e[i]) {
      // console.log(s[i])
      res += e[i];
    } else {
      // console.log("0")
      res += '1';
    }
  }
  const val = parseInt(res, 2);
  // console.log(`MAX - input: ${s} short: ${e} output: ${res} val: ${val}`)
  return [val, res];
}
/**
 * calculates the min and max range that can be represeted
 * @param s input string of a binary value
 * @param offset number of values at the end of s that are replaced
 * @returns min and max value
 */
export function getMinMaxRange(s: string, offset: number): [number, number] {
  const minRes = getMin(s, offset);
  const minVal = minRes[0];
  const maxRes = getMax(s, offset);
  const maxVal = maxRes[0];
  return [minVal, maxVal];
}
