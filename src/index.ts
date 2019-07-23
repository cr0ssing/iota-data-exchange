import { functionTypeAnnotation } from '@babel/types';
import DateTag from './DateTag';

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
  const lenght = l ? l : 4;
  const diff = lenght > s.length ? lenght - s.length : 0;

  for (let i = 0; i < diff; i++) {
    res += '0';
  }
  res += s;
  return res;
}
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
 */
export function getMinMaxRange(s: string, offset: number): [number, number] {
  const minRes = getMin(s, offset);
  const minVal = minRes[0];
  const maxRes = getMax(s, offset);
  const maxVal = maxRes[0];
  return [minVal, maxVal];
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
 * Calculates all the intermediary nodes between given string and root
 * @param s binary string that is used as a string point
 * @param start start value
 * @param end end value
 */
export function getChildNodes(s: string, start: number, end: number): string[] {
  let result = [];
  for (let i = 0; i < s.length - 1; i++) {
    /**
     * Fallunterscheidung wenn die letzte stellen 1 oder 0 ist
     */
    const caseZero = s.substr(0, s.length - 1 - i) + appendStrVals(i + 1, '0');
    const caseOne = s.substr(0, s.length - 1 - i) + appendStrVals(i + 1, '1');
    /**
     * Berechne mininmale und maximale Werterbereich der damit dargestellt werden kann
     */
    const caseZeroMinMax = getMinMaxRange(caseZero, i);
    const caseOneMinMax = getMinMaxRange(caseOne, i);

    /**
     * überprüfe ob der darzustellende Wertebereich den Start- oder Endwert überschreitet
     */
    const caseZeroValid =
      start <= caseZeroMinMax[0] && caseZeroMinMax[1] <= end;
    const caseOneValid = start <= caseOneMinMax[0] && caseOneMinMax[1] <= end;
    /**
     *
     */
    if (caseZeroValid && caseOneValid) {
      continue;
    } else if (caseZeroValid && !caseOneValid) {
      const res =
        caseZero.substr(0, s.length - 1 - i) + '0' + appendStrVals(i, 'X');
      result = [...result, res];
    } else if (!caseZeroValid && caseOneValid) {
      const res =
        caseOne.substr(0, s.length - 1 - i) + '1' + appendStrVals(i, 'X');
      result = [...result, res];
    }
  }
  return result;
}
/**
 * Calculcates the nodes needed for hashing
 * @param start starting leave
 * @param end ending leave
 */
export function getNodesForHashing(
  start: number,
  end: number,
  treeMax?: number
): string[] {
  treeMax = treeMax ? treeMax : 31;
  const depth = Math.ceil(Math.log2(treeMax));

  const startBin = start.toString(2);
  const endBin = end.toString(2);

  const startBinLong = buildStrBin(startBin, depth);
  const endBinLong = buildStrBin(endBin, depth);
  const startHashing = getChildNodes(startBinLong, start, end);
  const endHashing = getChildNodes(endBinLong, start, end);
  const allHashing = [...new Set([...startHashing, ...endHashing])];
  console.log(
    `-------------- \nStart: ${start} \nEnd: ${end} \nHashingVals(${allHashing.length}): [${allHashing}]`
  );
  return allHashing;
}
/**
 * Slice a Dateframe into multiple timeframes
 * @param start start date
 * @param end end date
 */
export function sliceDateframe(start: DateTag, end: DateTag) {
  const diffYear = end.year - start.year + 1;
  const diffMonth = end.month - start.month + 1;
  const diffDay = end.day - start.day + 1;
  const ranges = [];
  return checkYears(start, end);
}

/**
 * TODO
 * @param start start date
 * @param end end date
 */
export function checkYears(start: DateTag, end: DateTag) {
  if (start.year === end.year) {
    return checkMonths(start, end);
  } else {
    const years = checkYears(new DateTag(start.year + 1, 1, 1), end);
    return [...[start, new DateTag(start.year, 12, 31)], ...years];
  }
}
/**
 * Todo
 * @param start
 * @param end
 */
export function checkMonths(start: DateTag, end: DateTag) {
  if (start.month === end.month) {
    return checkDays(start, end);
  } else {
    const months = checkMonths(
      new DateTag(start.year, start.month + 1, 1),
      end
    );
    return [...[start, new DateTag(start.year, start.month, 31)], ...months];
  }
}
/**
 * Todo
 * @param start
 * @param end
 */
export function checkDays(start: DateTag, end: DateTag) {
  if (start.day === end.day) {
    return [start, end];
  } else {
    const days = checkDays(
      new DateTag(start.year, start.month, start.day + 1),
      end
    );
    return [
      ...[start, new DateTag(start.year, start.month, start.day)],
      ...days,
    ];
  }
}
/**
 * Todo
 * @param s
 * @param e
 */
export function getYears(s: DateTag, e: DateTag) {
  const diffYear = e.year - s.year;
  let years = [];
  for (let index = 0; index <= diffYear; index++) {
    years = [...years, s.year + index];
  }
  return years;
}
/**
 * Todo
 * @param s
 * @param e
 */
export function getMonths(s: DateTag, e: DateTag) {
  const diff = e.month - s.month;
  let list = [];
  for (let index = 0; index <= diff; index++) {
    list = [...list, s.month + index];
  }
  return list;
}
/**
 * Todo
 * @param s
 * @param e
 */
export function getDays(s: DateTag, e: DateTag) {
  const diff = e.day - s.day;
  let list = [];
  for (let index = 0; index <= diff; index++) {
    list = [...list, s.year + index];
  }
  return list;
}
/**
 * Todo
 * @param s
 * @param e
 */
export function fromYears(s: DateTag, e: DateTag) {
  const yearList = getYears(s, e);
  if (yearList.length === 1) {
    const hashes = getNodesForHashing(s.year, e.year, 9999);
    return fromMonths(s, e, hashes[0]);
  } else if (yearList.length === 2) {
    const yearStart = [s, new DateTag(yearList[0], 12, 31)];
    const yearEnd = [new DateTag(yearList[1], 1, 1), e];

    const hashesStart = getNodesForHashing(
      yearStart[0].year,
      yearStart[1].year,
      9999
    );
    const hashesEnd = getNodesForHashing(
      yearEnd[0].year,
      yearEnd[1].year,
      9999
    );
    const hashesStartSub = fromMonths(
      yearStart[0],
      yearStart[1],
      hashesStart[0]
    );
    const hashesEndSub = fromMonths(yearEnd[0], yearEnd[1], hashesEnd[0]);
    return [
      ...hashesStartSub.map(el => hashesStart[0] + el),
      ...hashesEndSub.map(el => hashesEnd[0] + el),
    ];
  } else if (yearList.length === 3) {
    const yearStart = [s, new DateTag(yearList[0], 12, 31)];
    const yearEnd = [new DateTag(yearList[-1], 1, 1), e];
    const yearRest = [yearList[1], yearList[-2]];
    const hashesStart = getNodesForHashing(
      yearStart[0].year,
      yearStart[1].year,
      9999
    );
    const hashesEnd = getNodesForHashing(
      yearEnd[0].year,
      yearEnd[1].year,
      9999
    );
    const hashesRest = getNodesForHashing(yearRest[0], yearRest[1], 9999);
    const hashesStartSub = fromMonths(
      yearStart[0],
      yearStart[1],
      hashesStart[0]
    );
    const hashesEndSub = fromMonths(yearEnd[0], yearEnd[1], hashesEnd[0]);
    return [...hashesStartSub, ...hashesEndSub, ...hashesRest];
  } else {
    throw Error('yearList empty');
  }
}
/**
 * Todo
 * @param s
 * @param e
 * @param p
 */
export function fromMonths(s: DateTag, e: DateTag, p: string) {
  const list = getMonths(s, e);
  if (list.length === 1) {
    const hashes = getNodesForHashing(s.month, e.month, 12);
    return fromDays(s, e, hashes[0]).map(el => p + el);
  } else if (list.length === 2) {
    const firstElem = [s, new DateTag(e.year, list[0], 31)];
    const lastElem = [new DateTag(list[1], 1, 1), e];

    const hashesStart = getNodesForHashing(
      firstElem[0].month,
      firstElem[1].month,
      12
    );

    const hashesEnd = getNodesForHashing(
      lastElem[0].month,
      lastElem[1].month,
      12
    );
    const hashesStartSub = fromDays(firstElem[0], firstElem[1], hashesStart[0]);
    const hashesEndSub = fromDays(lastElem[0], lastElem[1], hashesEnd[0]);
    return [
      ...hashesStartSub.map(el => p + el),
      ...hashesEndSub.map(el => p + el),
    ];
  } else if (list.length >= 2) {
    const firstElem = [s, new DateTag(e.year, list[0], 31)];
    const lastElem = [new DateTag(e.year, list[list.length - 1], 1), e];
    const restElem = [list[1], list[list.length - 2]];

    const hashesStart = getNodesForHashing(
      firstElem[0].month,
      firstElem[1].month,
      12
    );

    const hashesEnd = getNodesForHashing(
      lastElem[0].month,
      lastElem[1].month,
      12
    );
    const hashesStartSub = fromDays(firstElem[0], firstElem[1], hashesStart[0]);
    const hashesEndSub = fromDays(lastElem[0], lastElem[1], hashesEnd[0]);
    const hashesRest = getNodesForHashing(restElem[0], restElem[1], 12);
    return [
      ...hashesStartSub.map(el => p + el),
      ...hashesEndSub.map(el => p + el),
      ...hashesRest.map(el => p + el),
    ];
  } else {
    throw Error('yearList empty');
  }
}
/**
 * Todo
 * @param s
 * @param e
 * @param p
 */
export function fromDays(s: DateTag, e: DateTag, p: string) {
  const list = getDays(s, e);
  const hashes = getNodesForHashing(s.day, e.day, 31);
  const prefixHashes = hashes.map(el => p + el);

  return prefixHashes;
  // Todo extend to support minutes and seconds
  if (list.length === 1) {
    getNodesForHashing(s.day, e.day, 31);
  } else if (list.length === 2) {
    const firstElem = [s, new DateTag(e.year, e.month, e.day)];
    getNodesForHashing(s.day, e.day, 31);

    const lastElem = [new DateTag(list[1], 1, 1), e];
    getNodesForHashing(s.year, e.year, 9999);
    getNodesForHashing(lastElem[0].month, lastElem[1].month, 99);
  } else if (list.length === 3) {
    const yearStart = [s, new DateTag(list[0], 12, 31)];
    const yearEnd = [new DateTag(list[-1], 1, 1), e];
    const yearRest = [list[1], list[-2]];
  } else {
    throw Error('yearList empty');
  }
}
const dateStart = new DateTag(2019, 4, 1);
const dateEnd = new DateTag(2020, 5, 3);

fromYears(dateStart, dateEnd).map(e =>
  console.log(parseInt(e.substr(0, 14), 2), parseInt(e.substr(14, 18), 2))
);
