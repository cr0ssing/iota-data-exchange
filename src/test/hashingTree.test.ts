import * as converter from '@iota/converter';
import { hash } from '../hashingTree';

describe('Kerl hashing', () => {
  it('should return a valid hash', () => {
    const stringTrytes = converter.asciiToTrytes('HELLOWORLD');
    const trits = converter.trytesToTrits(stringTrytes);
    const tritsAdd1 = converter.trits('A');
    const tritsAdd2 = converter.trits('A');
    const tritsAdd3 = converter.trits('AA');

    const hash1 = hash(trits, tritsAdd1);
    const hash2 = hash(hash1, tritsAdd2);
    const hash3 = hash(trits, tritsAdd3);
    const hashTrytes1 = converter.tritsToTrytes(hash1);
    const hashTrytes2 = converter.tritsToTrytes(hash2);
    const hashTrytes3 = converter.tritsToTrytes(hash3);
    expect(hashTrytes2).toBe(hashTrytes3);
  });
});
