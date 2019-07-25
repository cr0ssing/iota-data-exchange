import { hashBinArray } from '../hashingTree';
import { binStrToTernStr, binToNumberArray } from '../ternaryStringOperations';

describe('Hashing Tree', () => {
  it('should generate a hashed value', () => {
    const input = '010101';
    const inputTernary = binStrToTernStr(input);
    const secret = 'mySecret';
    const hash = hashBinArray(input, secret);
    expect(hash).toBe('');
  });
});
