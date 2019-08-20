import { getMax, getMin, getMinMaxRange } from './binaryMinMax';
import { appendStrVals, buildStrBin, getDiff } from './binaryStringOperations';
import DateTag from './DateTag';
import { EDateTagProps, EDay, EMonth, EYear } from './typings/Date';

/**
 * Calculates all the intermediary nodes between given string and root
 * @param s binary string that is used as a string point
 * @param start overall min value
 * @param end overall max value
 */
export function getChildNodes(s: string, start: number, end: number): string[] {
  let result = [];
  const sMin = getMin(s, s.length - 1)[0];
  const sMax = getMax(s, s.length - 1)[0];
  /**
   * Randfall betrachtung
   */
  if (start === 0 && end === getMax(s, s.length)[0]) {
    // gesamter Baum
    return result;
  } else if (start === sMin && end === sMax) {
    // linke oder rechte hälfte des Baumes
    return [s[0] + appendStrVals(s.length - 1, 'X')];
  }
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
  if (result.length > 0) {
    return result;
  } else {
    return [s[0] + appendStrVals(s.length - 1, 'X')];
  }
}
/**
 * Calculcates the nodes needed for hashing
 * @param start starting leave
 * @param end ending leave
 */
export function getNodesForHashing(
  start: number,
  end: number,
  treeMax: number
): string[] {
  const depth = Math.ceil(Math.log2(treeMax));

  const startBin = start.toString(2);
  const endBin = end.toString(2);
  if (
    getMin(startBin, depth)[0] === start &&
    getMin(endBin, depth)[0] === end &&
    startBin !== endBin
  ) {
    return [];
  } else {
    const startBinLong = buildStrBin(startBin, depth);
    const endBinLong = buildStrBin(endBin, depth);

    const startHashing = getChildNodes(startBinLong, start, end);
    const endHashing = getChildNodes(endBinLong, start, end);
    const allHashing = [...new Set([...startHashing, ...endHashing])];
    return allHashing;
  }
}
export function getNodesBetween(s: DateTag, e: DateTag) {
  return fromYears(s, e);
}
/**
 * Todo
 * @param s
 * @param e
 */
export function fromYears(s: DateTag, e: DateTag) {
  /**
   * extract the years
   */
  const yearList = getDiff(s, e, EDateTagProps.YEAR);
  if (yearList.length === 1) {
    /**
     * If the range is only one year no split is needed.
     */

    const hashes = buildStrBin(s.year.toString(2), EYear.depth);
    /**
     * go deeper and check the months
     */
    return fromMonths(s, e, hashes);
  } else if (yearList.length === 2) {
    /**
     * if the range is between two years split them into two different timeframes.
     * The first is the range from the start till the end of the year.
     * The second is the range from the beginning of the second year till the end.
     */
    const yearStart = [s, null];
    const yearEnd = [null, e];
    // calculate the nodes for the range start year
    const hashesStart = buildStrBin(yearStart[0].year.toString(2), 14);

    // calculate the nodes for the range start year
    const hashesEnd = buildStrBin(yearEnd[1].year.toString(2), 14);

    // calculate the nodes for the range end year
    const hashesStartSub = fromMonths(yearStart[0], yearStart[1], hashesStart);
    const hashesEndSub = fromMonths(yearEnd[0], yearEnd[1], hashesEnd);
    return [...hashesStartSub, ...hashesEndSub];
  } else if (yearList.length > 2) {
    /**
     * If the timeframe is bigger than two years split it into three parts.
     * First the start till the end of the start year.
     * Second the years between start and end. These years have no deeper nodes.
     * Third the beginning of the end year till the end of the end year.
     */
    const yearStart = [s, null];
    const yearEnd = [null, e];
    const yearRest = [...new Set([yearList[1], yearList[yearList.length - 2]])];

    const hashesStart = [buildStrBin(s.year.toString(2), EYear.depth)];
    const hashesEnd = [buildStrBin(e.year.toString(2), EYear.depth)];
    const hashesRest =
      yearRest.length > 1
        ? getNodesForHashing(yearRest[0], yearRest[1], EYear.max)
        : [buildStrBin(yearRest[0].toString(2), EYear.depth)];
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
export function fromMonths(s: DateTag | null, e: DateTag | null, p: string) {
  const list = getDiff(s, e, EDateTagProps.MONTH);
  let firstElem: DateTag[] | undefined;
  let lastElem: DateTag[] | undefined;
  let restElem: number[];

  if (list.length === 1) {
    const hashes = [buildStrBin(s.month.toString(2), EMonth.depth)];
    return fromDays(s, e, hashes[0]).map(el => p + el);
  } else if (list.length === 2) {
    // Case 1 - until end of year
    if (s !== null && e === null) {
      firstElem = [s, new DateTag(s.year, s.month, EDay.max)];
    }
    // Case 2 - from beginning of year
    else if (s === null && e !== null) {
      lastElem = [new DateTag(e.year, e.month, EDay.min), e];
    }
    // Case 3 - start and end is in the same year, split needed
    else if (s !== null && e !== null) {
      firstElem = [s, new DateTag(e.year, list[0], EDay.max)];
      lastElem = [new DateTag(e.year, list[list.length - 1], EDay.min), e];
    }
    let res = [];
    if (firstElem) {
      const hashesStart = getNodesForHashing(
        firstElem[0].month,
        firstElem[1].month,
        EMonth.max
      );
      const hashesStartSub = fromDays(
        firstElem[0],
        firstElem[1],
        hashesStart[0]
      );
      res = [...res, ...hashesStartSub.map(el => p + el)];
    }
    if (lastElem) {
      const hashesEnd = getNodesForHashing(
        lastElem[0].month,
        lastElem[1].month,
        EMonth.max
      );
      const hashesEndSub = fromDays(lastElem[0], lastElem[1], hashesEnd[0]);
      res = [...res, ...hashesEndSub.map(el => p + el)];
    }

    return res;
  } else if (list.length > 2) {
    // Case 1 - until end of year
    if (s !== null && e === null) {
      firstElem = [s, new DateTag(s.year, s.month, EDay.max)];
      restElem = [list[1], list[list.length - 1]];
    }
    // Case 2 - from beginning of year
    else if (s === null && e !== null) {
      lastElem = [new DateTag(e.year, e.month, EDay.min), e];
      restElem = [list[0], list[list.length - 2]];
    }
    // Case 3 - start and end is in the same year, split needed
    else if (s !== null && e !== null) {
      firstElem = [s, new DateTag(e.year, list[0], EDay.max)];
      lastElem = [new DateTag(e.year, list[list.length - 1], EDay.min), e];
      restElem = [list[1], list[list.length - 2]];
    }

    const hashesStart = firstElem
      ? getNodesForHashing(firstElem[0].month, firstElem[1].month, EMonth.max)
      : [];

    const hashesEnd = lastElem
      ? getNodesForHashing(lastElem[0].month, lastElem[1].month, EMonth.max)
      : [];
    const hashesRest = getNodesForHashing(restElem[0], restElem[1], EMonth.max);

    const hashesStartSub = firstElem
      ? fromDays(firstElem[0], firstElem[1], hashesStart[0])
      : [];
    const hashesEndSub = lastElem
      ? fromDays(lastElem[0], lastElem[1], hashesEnd[0])
      : [];
    return [
      ...hashesStartSub.map(el => p + el),
      ...hashesEndSub.map(el => p + el),
      ...hashesRest.map(el => p + el),
    ];
  } else {
    throw Error('Month list empty');
  }
}
/**
 * Todo
 * @param s
 * @param e
 * @param p
 */
export function fromDays(s: DateTag, e: DateTag, p: string) {
  const list = getDiff(s, e, EDateTagProps.DAY);
  const hashes = getNodesForHashing(s.day, e.day, EDay.max);
  const prefixHashes = hashes.map(el => p + el);
  if (prefixHashes.length > 0) {
    return prefixHashes;
  } else {
    return [p];
  }
  // Todo extend to support minutes and seconds
}
