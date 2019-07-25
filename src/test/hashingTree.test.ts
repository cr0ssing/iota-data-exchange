import { hashBinArray } from '../hashingTree';
import { binStrToTernStr, binToNumberArray } from '../ternaryStringOperations';
import DateTag from '../DateTag';
import { fromYears } from '../treeCalculation';

describe('Hashing Tree', () => {
  it('should generate a hashed value', () => {
    const input = '0101';
    const inputExt = '01';
    const secret = 'mySecret';
    const hash = hashBinArray(input, secret, false);
    const hash2 = hashBinArray(inputExt, hash, true);
    const hashRef = hashBinArray(input + inputExt, secret, false);
    // expect(hash).toBe(
    //   '9KPCLHMNXRKY9VGBBHVBLFNCCGRNMMWHFJAQJSI9GEKUQLFHC99PWYONFRCQMBNGPOWZWPQIZERZXPWDV'
    // );
    // expect(hash2).toBe(
    //   '9KPCLHMNXRKY9VGBBHVBLFNCCGRNMMWHFJAQJSI9GEKUQLFHC99PWYONFRCQMBNGPOWZWPQIZERZXPWDV'
    // );
    expect(hash2).toStrictEqual(hashRef);
  });
  it('should multiple hashed value from DateRange', () => {
    const dateStart = new DateTag(2019, 4, 1);
    const dateEnd = new DateTag(2019, 4, 2);
    const res = fromYears(dateStart, dateEnd).map(e => e.replace('X', ''));
    const input = '00011111100011010000001';
    const input1 = '00011111100011010000010';
    // const input = '1';
    // const input1 = '0';
    const inputExt = '01';
    const secret = 'mySecret';
    const hashInput = hashBinArray(input, secret, false);
    const hashInputExt = hashBinArray(inputExt, hashInput, true);
    const hashRefInput = hashBinArray(input + inputExt, secret, false);
    // const hashedList = res.map(e => hashBinArray(e, secret, false));
    const hashInput1 = hashBinArray(input1, secret, false);
    const hashInputExt1 = hashBinArray(inputExt, hashInput1, true);
    const hashRefInput1 = hashBinArray(input1 + inputExt, secret, false);
    // const hashedList = res.map(e => hashBinArray(e, secret, false));
    // expect(hash).toBe(
    //   '9KPCLHMNXRKY9VGBBHVBLFNCCGRNMMWHFJAQJSI9GEKUQLFHC99PWYONFRCQMBNGPOWZWPQIZERZXPWDV'
    // );
    // expect(hash2).toBe(
    //   '9KPCLHMNXRKY9VGBBHVBLFNCCGRNMMWHFJAQJSI9GEKUQLFHC99PWYONFRCQMBNGPOWZWPQIZERZXPWDV1'
    // );
    expect(hashInputExt).toStrictEqual(hashRefInput);
    expect(hashInputExt1).toStrictEqual(hashRefInput1);
    expect(hashInput === hashInput1).toBe(false);
  });
});
