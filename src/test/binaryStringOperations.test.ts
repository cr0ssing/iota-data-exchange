import { buildStrBin } from '../binaryStringOperations';

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
