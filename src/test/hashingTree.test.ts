import * as converter from '@iota/converter';
import DateTag from '../DateTag';
import { hash, hashFromBinStr, hashFromDatetag } from '../hashingTree';
import { binStrToTrits } from '../ternaryStringOperations';
import { fromYears } from '../treeCalculation';

describe('Curl hashing', () => {
  it('should return the same hash', () => {
    const stringTrytes = converter.asciiToTrytes('HELLOWORLD');
    const trits = converter.trytesToTrits(stringTrytes);
    const tritsAdd1 = converter.trits('A');
    const tritsAdd2 = converter.trits('A');
    const tritsAdd3 = converter.trits('AA');

    const hash1 = hash(trits, tritsAdd1);
    const hash2 = hash(hash1, tritsAdd2);
    const hash3 = hash(trits, tritsAdd3);
    const hashTrytes2 = converter.tritsToTrytes(hash2);
    const hashTrytes3 = converter.tritsToTrytes(hash3);
    expect(hashTrytes2).toBe(hashTrytes3);
  });
  it('should return the same hash', () => {
    const date = new DateTag(2019, 5, 2);
    const secret = 'HELLOWORLD';

    const hashFromDate = hashFromDatetag(secret, date);
    const hashFromDateStr = hashFromBinStr(secret, date.toBinStr());

    expect(hashFromDate).toBe(hashFromDateStr);
  });
  it('should build the same hash', () => {
    const date = new DateTag(2019, 5, 2);
    const secret = 'HELLOWORLD';

    const dateStr1 = '11111100011101101';
    const dateStr2 = '1111110001110110';
    const hash1 = hashFromBinStr(secret, dateStr1);
    const hash2 = hashFromBinStr(secret, dateStr2);
    const hash3 = converter.trytes(
      hash(converter.trits(hash2), binStrToTrits('1'))
    );
    expect(hash1).toBe(hash3);
  });
});

describe('Hash from datetag', () => {
  it('should return hash for date', () => {
    const date = new DateTag(2019, 5, 1);
    const secret = 'HELLOWORLD';
    const res = hashFromDatetag(secret, date);
    expect(res).toBe(
      'RYWFCMQJUBDLWVRTIDDQLSFSNGVAOVLXMWDRYXCSNMCXNMIKBIKAXSPETFCFK9EKHIDIVJOR99YCNXVNI'
    );
  });
  it('should return the same as from binary string', () => {
    const secret = 'HELLOWORLD';
    const date = new DateTag(2019, 5, 1);
    const binaryString = date.toBinStr();
    const res1 = hashFromDatetag(secret, date);
    const res2 = hashFromBinStr(secret, binaryString);
    expect(res1).toStrictEqual(res2);
  });
  it('should return hashes for daterange', () => {
    const dateStart = new DateTag(2019, 5, 1);
    const dateEnd = new DateTag(2019, 5, 3);
    const hashList = fromYears(dateStart, dateEnd);
    const secret = 'HELLOWORLD';
    const res = hashList.map(e => {
      return { key: e, val: hashFromBinStr(secret, e) };
    });
    const partRes = res[1].val;
    const partResTrit = converter.trits(partRes);
    const endHash = converter.trytes(hash(partResTrit, binStrToTrits('1')));
    const hasofEnd = hashFromDatetag(secret, dateEnd);
    expect(endHash).toBe(hasofEnd);
  });
});
