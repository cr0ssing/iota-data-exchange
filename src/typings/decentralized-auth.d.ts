declare module '@decentralized-auth/ntru' {
  import { type } from 'os';
  import { Trytes } from '@iota/core/typings/types';
  function iotaFromTrytes(trytes: Trytes): string;
  function toBytes(str: string): Uint8Array;
  function createKeyPair(seed: string): KeyPair;
  function toTrytes(buffer: Buffer): Trytes;
  function fromTrytes(trytes: Trytes): Buffer;
  function decrypt(trytes: Trytes, privateKey: PrivateKey): string;
  function encrypt(str: string | Uint8Array, publicKey: PublicKey): Trytes;
  function toTrytes(str: string): string;
  type PrivateKey = Buffer | Uint8Array;
  type PublicKey = Buffer | Uint8Array;
  interface KeyPair {
    private: PrivateKey;
    public: PublicKey;
  }
}
