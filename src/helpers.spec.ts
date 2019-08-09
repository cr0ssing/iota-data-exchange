import { ntru } from 'ntru';
import DateTag from './DateTag';
import { dateTagFromBinStr, decryptTag, encryptTag } from './helpers';
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
describe('Encrypt tag', () => {
  it('should create a full sized Tag element', async () => {
    const keyPair = await ntru.keyPair();
    const tagString = 'TagVeryyLongStringBecauseitissecure';
    const encTag = await encryptTag(
      tagString,
      keyPair.publicKey,
      keyPair.privateKey
    );
    const decTag = await decryptTag(encTag, keyPair.privateKey);
    expect(encTag).toBe(decTag);
  });
});
