import {
  binStrToTernStr,
  binToNumberArray,
  fillBinStr,
} from '../lib/ternaryStringOperations';

describe('Binary string to ternary conversion', () => {
  const input = '001';
  it('should return single Ternary Value', () => {
    const res = binStrToTernStr(input);
    expect(res).toBe('I');
  });
  it('should return filled with -1 Ternary Value', () => {
    const res = binStrToTernStr(input + '0');
    expect(res).toBe('IO');
  });
});
describe('Binary to number array conversion', () => {
  it('should return same length', () => {
    const input = '010101';
    const res = binToNumberArray(input);
    expect(res.length).toBe(input.length);
  });
});
describe('Binary to Ternary fill', () => {
  it('should return same string', () => {
    const input = binToNumberArray('111');
    const res = fillBinStr(input);
    expect(res.length).toBe(3);
    expect(res).toStrictEqual(input);
  });
  it('should add one -1', () => {
    const input = binToNumberArray('11');
    const res = fillBinStr(input);
    expect(res.length).toBe(3);
    expect(res).toStrictEqual([1, 1, -1]);
  });
  it('should add two -1', () => {
    const input = binToNumberArray('1');
    const res = fillBinStr(input);
    expect(res.length).toBe(3);
    expect(res).toStrictEqual([1, -1, -1]);
  });
  it('should add nothing', () => {
    const input = binToNumberArray('');
    const res = fillBinStr(input);
    expect(res.length).toBe(0);
    expect(res).toStrictEqual([]);
  });
});
