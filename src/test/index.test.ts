import DateTag from '../DateTag';
import {
  buildStrBin,
  fromYears,
  getChildNodes,
  getDiff,
  getMinMaxRange,
  getNodesForHashing,
} from '../index';
import { EDateTagProps, EDay, EMonth, EYear } from '../typings/Date';

describe('Binary number', () => {
  const lenght = 3;

  it('should have fixed lenght', () => {
    const a = parseInt('1', 10).toString(2);
    expect(buildStrBin(a, lenght).length).toBe(lenght);
  }),
    it('fill short numbers with zeros', () => {
      const a = parseInt('1', 10).toString(2);
      const result = buildStrBin(a, lenght);
      expect(result.substr(0, lenght - 1)).toBe('00');
      expect(result.length === lenght).toBe(true);
    }),
    it('do not fill long numbers with zeros', () => {
      const a = parseInt('7', 10).toString(2);

      const result = buildStrBin(a, lenght);
      expect(result === a).toBe(true);
      expect(result.length === lenght).toBe(true);
    }),
    it('throw error if to long', () => {
      const a = parseInt('50', 10).toString(2);
      expect(() => {
        buildStrBin(a, lenght);
      }).toThrowError(Error());
    });
});
describe('Range calucaltion', () => {
  it('return correct min and max value', () => {
    const binStr = '010';
    const range0 = getMinMaxRange(binStr, 0);
    expect(range0[0]).toBe(2);
    expect(range0[1]).toBe(2);
  });
  it('return correct min and max value for one X', () => {
    const binStr = '010';
    const range0 = getMinMaxRange(binStr, 1);
    expect(range0[0]).toBe(2);
    expect(range0[1]).toBe(3);
  });
  it('return correct min and max value for two X', () => {
    const binStr = '010';
    const range0 = getMinMaxRange(binStr, 2);
    expect(range0[0]).toBe(0);
    expect(range0[1]).toBe(3);
  });
});
describe('GetDiff', () => {
  it('should return the diff of two moths', () => {
    const startDate = new DateTag(2019, 2, 10);
    const endDate = new DateTag(2019, 5, 15);
    const diffMonths = getDiff(startDate, endDate, EDateTagProps.MONTH);
    expect(diffMonths).toStrictEqual([2, 3, 4, 5]);
  });
  it('should return the diff of two days', () => {
    const startDate = new DateTag(2019, 2, 10);
    const endDate = new DateTag(2019, 5, 15);
    const diffDays = getDiff(startDate, endDate, EDateTagProps.DAY);
    expect(diffDays).toStrictEqual([10, 11, 12, 13, 14, 15]);
  });
});
describe('Child Node Caluclation', () => {
  it('should return tree root', () => {
    const result = getChildNodes('0011', 0, 15);
    expect(result).toStrictEqual([]);
  }),
    it('should return some leaf on the left and none from right side', () => {
      const result = getChildNodes('0001', 1, 12);
      expect(result).toStrictEqual(['0001', '001X', '01XX']);
    });
  it('should return some leaf on the right and none from left side', () => {
    const result = getChildNodes('1111', 1, 13);
    expect(result).toStrictEqual(['110X', '10XX']);
  });
  it('should return left side', () => {
    const result = getChildNodes('0000', 0, 7);
    expect(result).toStrictEqual(['0XXX']);
  });
  it('should return right  side', () => {
    const result = getChildNodes('1111', 8, 15);
    expect(result).toStrictEqual(['1XXX']);
  });
});
describe('Hashnode calculation', () => {
  it('for one year', () => {
    const year = 2019;
    const yearBin = buildStrBin(year.toString(2), 14);
    const res = getNodesForHashing(year, year, EYear.max);
    expect(res).toStrictEqual([yearBin]);
  });
  it('for two year', () => {
    const year1 = 2019;
    const year2 = 2020;
    const yearBin1 = buildStrBin(year1.toString(2), 14);
    const yearBin2 = buildStrBin(year2.toString(2), 14);
    const res = getNodesForHashing(year1, year2, EYear.max);
    expect(res).toStrictEqual([yearBin1, yearBin2]);
  });
  it('for three year', () => {
    const year1 = 2019;
    const year2 = 2021;
    const yearBin1 = buildStrBin(year1.toString(2), 14);
    const res = getNodesForHashing(year1, year2, EYear.max);
    expect(res).toStrictEqual([yearBin1, '0001111110010X']);
  });
  it('for thirst month', () => {
    const month1 = EMonth.min;
    const month2 = EMonth.min;
    const res = getNodesForHashing(month1, month2, EMonth.max);
    expect(res).toStrictEqual(['0000']);
  });
  it('for last month', () => {
    const month1 = EMonth.max;
    const month2 = EMonth.max;
    const res = getNodesForHashing(month1, month2, EMonth.max);
    expect(res).toStrictEqual(['1111']);
  });
  it('for complete month', () => {
    const month1 = EMonth.min;
    const month2 = EMonth.max;
    const res = getNodesForHashing(month1, month2, EMonth.max);
    expect(res).toStrictEqual([]);
  });
  it('for intermediar month', () => {
    const month1 = EMonth.min + 5;
    const month2 = EMonth.max - 5;
    const res = getNodesForHashing(month1, month2, EMonth.max);
    expect(res).toStrictEqual(['0101', '011X', '1010', '100X']);
  });
});
describe('Nodes from daterange', () => {
  it('for one day', () => {
    const dateStart = new DateTag(2019, 4, 1);
    const dateEnd = new DateTag(2019, 4, 2);
    const res = fromYears(dateStart, dateEnd);
    expect(res).toStrictEqual([
      '00011111100011010000001', // 2019-04-01
      '00011111100011010000010', // 2019-04-02
    ]);
  });
  it('for one year', () => {
    const dateStart = new DateTag(2019, 4, EDay.min);
    const dateEnd = new DateTag(2019, 4, EDay.max);
    const res = fromYears(dateStart, dateEnd);
    expect(res).toStrictEqual([
      '000111111000110100', // 2019
    ]);
  });
  it('specific daterange same year different months', () => {
    const dateStart = new DateTag(2019, 3, 5);
    const dateEnd = new DateTag(2019, 8, 10);
    const res = fromYears(dateStart, dateEnd);
    expect(res).toStrictEqual([
      '00011111100011001100101', // 2019-03-05
      '0001111110001100110011X', // 2019-03-06 - 2019-03-07
      '00011111100011001101XXX', // 2019-03-08 - 2019-03-15
      '0001111110001100111XXXX', // 2019-03-16 - 2019-03-31
      '00011111100011100000XXX', // 2019-08-00 - 2019-08-07
      '00011111100011100001010', // 2019-08-10
      '0001111110001110000100X', // 2019-08-08 - 2019-08-09
      '0001111110001101XX', // 2019-04    - 2019-07
    ]);
  });
  it('specific daterange two year different months', () => {
    const dateStart = new DateTag(2019, 3, 5);
    const dateEnd = new DateTag(2020, 8, 10);
    const res = fromYears(dateStart, dateEnd);
    expect(res.sort()).toStrictEqual(
      [
        '00011111100011001100101', // 2019-03-05
        '0001111110001100110011X', // 2019-03-06 - 2019-03-07
        '00011111100011001101XXX', // 2019-03-08 - 2019-03-15
        '0001111110001100111XXXX', // 2019-03-16 - 2019-03-31
        '0001111110001101XX', // 2019-04    - 2019-07
        '000111111000111XXX', // 2019-08    - 2019-15
        '00011111100100100000XXX', // 2020-08-00    - 2020-08-07
        '00011111100100100001010', // 2020-08-10
        '0001111110010010000100X', // 2020-08-08    - 2020-08-09
        '000111111001000XXX', // 2020-00    - 2020-07
      ].sort()
    );
  });
  it('specific daterange three year different months', () => {
    const dateStart = new DateTag(2019, 3, 5);
    const dateEnd = new DateTag(2021, 8, 10);
    const res = fromYears(dateStart, dateEnd);
    expect(res.sort()).toStrictEqual(
      [
        '00011111100011001100101', // 2019-03-05
        '0001111110001100110011X', // 2019-03-06 - 2019-03-07
        '00011111100011001101XXX', // 2019-03-08 - 2019-03-15
        '0001111110001100111XXXX', // 2019-03-16 - 2019-03-31
        '0001111110001101XX', // 2019-04    - 2019-07
        '000111111000111XXX', // 2019-08    - 2019-15
        '00011111100100', // 2020
        '000111111001010XXX', // 2021-00    - 2021-07
        '00011111100101100000XXX', // 2021-08-00    - 2021-08-07
        '0001111110010110000100X', // 2021-08-08    - 2021-08-09
        '00011111100101100001010', // 2021-08-10
      ].sort()
    );
  });
  it('specific daterange four year different months', () => {
    const dateStart = new DateTag(2019, 3, 5);
    const dateEnd = new DateTag(2022, 8, 10);
    const res = fromYears(dateStart, dateEnd);
    expect(res.sort()).toStrictEqual(
      [
        '00011111100011001100101', // 2019-03-05
        '0001111110001100110011X', // 2019-03-06 - 2019-03-07
        '00011111100011001101XXX', // 2019-03-08 - 2019-03-15
        '0001111110001100111XXXX', // 2019-03-16 - 2019-03-31
        '0001111110001101XX', // 2019-04    - 2019-07
        '000111111000111XXX', // 2019-08    - 2019-15
        '0001111110010X', // 2020 - 2021
        '000111111001100XXX', // 2022-00    - 2022-07
        '00011111100110100000XXX', // 2022-08-00    - 2022-08-07
        '0001111110011010000100X', // 2022-08-08    - 2022-08-09
        '00011111100110100001010', // 2022-08-10
      ].sort()
    );
  });
});
