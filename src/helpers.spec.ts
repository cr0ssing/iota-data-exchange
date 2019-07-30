import DateTag from './DateTag';
import { dateTagFromBinStr } from './helpers';
import { EFillOptions } from './typings/Constants';

describe('Datetag from binary string generation', () => {
  it('should return the min date', () => {
    const dateMin = new DateTag(2019, 6, 10);
    const dateMinBin = dateMin.toBinStr();
    const dateMax = new DateTag(2019, 6, 11);
    const dateMaxBin = dateMax.toBinStr();
    const dateBinCheck = dateMinBin.substring(0, dateMinBin.length - 1) + 'X';
    const resMin = dateTagFromBinStr(dateBinCheck, EFillOptions.MIN);
    const resMax = dateTagFromBinStr(dateBinCheck, EFillOptions.MAX);
    expect(resMin).toStrictEqual(dateMin);
    expect(resMax).toStrictEqual(dateMax);
  });
});
