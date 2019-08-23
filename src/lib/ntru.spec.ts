import { createKeyPair, toTrytes } from '@decentralized-auth/ntru';
import { ntru } from 'ntru';
import { TextDecoder } from 'text-encoding';
import { DEFAULT_ECDH_CURVE } from 'tls';
import { defaultSeed, defaultSeedOwner } from './config';
import { generateSeed } from './iotaUtils';
import {
  createKeyPair as createKeyPairAlt,
  decrypt,
  encrypt,
  fromTrytes,
  toStringTrytes,
  toTrytes as toTrytes2,
} from './ntru';

describe('NTRU', () => {
  it('should do the same', async () => {
    const seed = defaultSeed;

    const a = createKeyPair(seed);
    const c = createKeyPair(defaultSeedOwner);
    const b = await createKeyPairAlt('');
    const d = await createKeyPairAlt('');
    const encoder = new TextDecoder('utf-8');
    const encStr = encoder.decode(b.publicKey);
    const aStr1 = toTrytes(a.public);
    const bStr1 = toTrytes(b.publicKey);
    const str = toStringTrytes(b.publicKey);
    const cStr1 = toTrytes(c.public);
    const dStr1 = toTrytes(d.publicKey);
    const ac = aStr1 === cStr1;
    const bd = bStr1 === dStr1;
    const bBuff = fromTrytes(bStr1);
    const dBuff = fromTrytes(dStr1);
    const b1Buff = bBuff === b.publicKey;
    const d1Buff = dBuff === d.publicKey;
    const bStr2 = toTrytes(b.publicKey);
    const aStr = toTrytes2(a.public);
    const bStr = toTrytes2(b.publicKey);
    const lengA = aStr.length;
    const lengB = bStr.length;
    const encMsg = await encrypt('HelloWorld', bStr);
    const decMsg = await decrypt(encMsg, b.privateKey);
    expect(aStr1).toStrictEqual(aStr);
    expect(bStr1).toStrictEqual(bStr);
    expect(a).toBe(b);
  });
});
