import { decrypt, encrypt, PrivateKey } from '@decentralized-auth/ntru';
import { asciiToTrytes, trytesToAscii } from '@iota/converter';
import { API, Transfer } from '@iota/core/typings/core/src';
import { Trytes } from '@iota/core/typings/types';
import { Bundle } from '@iota/http-client/typings/types';
import { AES, enc } from 'crypto-js';
import { toUnicode } from 'punycode';
import { defaultDepth, defaultMwm } from './config';

export function generateSeed(length = 81) {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ9';
  const retVal = [];
  for (let i = 0, n = charset.length; i < length; ++i) {
    retVal[i] = charset.charAt(Math.floor(Math.random() * n));
  }
  const result = retVal.join('');
  return result;
}

export async function sentMsgToTangle(
  iota: API,
  seed: string,
  address: string,
  message: Trytes,
  tag: string,
  depth: number = defaultDepth,
  mwm: number = defaultMwm
): Promise<Bundle> {
  const transfers: Transfer[] = [
    {
      address,
      message,
      tag,
      value: 0,
    },
  ];
  try {
    const prepTransfersTrytes = await iota.prepareTransfers(seed, transfers);
    const attachedBundle: Bundle = await iota.sendTrytes(
      prepTransfersTrytes,
      depth /*depth*/,
      mwm /*MWM*/
    );
    return attachedBundle;
  } catch (error) {
    throw error;
  }
}
/**
 * Parse a bundle that is a WelcomeMessage
 * @param bundle
 */
export async function parseWelcomeMessage(bundle: Bundle, key: PrivateKey) {
  const tagTrytes = bundle[0].tag.replace(/9*$/, '');
  const tagString = trytesToAscii(tagTrytes)
    .split('-')
    .map(e => parseInt(e, 10));
  const temp = bundle.slice();
  const sigFrag = temp
    .sort((a, b) => a.currentIndex - b.currentIndex)
    .map(t => t.signatureMessageFragment)
    .reduce((a, b) => a + b);
  const secretTrytes = sigFrag.substring(0, tagString[0]);
  const secret = await decrypt(secretTrytes, key);
  const msgTrytes = sigFrag.substring(
    tagString[0],
    tagString[0] + tagString[1]
  );
  const msgTrytesAscii = trytesToAscii(msgTrytes);
  const msgDecryptedBytes = await AES.decrypt(msgTrytesAscii, secret);
  const msgDecryptedString = msgDecryptedBytes.toString(enc.Utf8);
  return msgDecryptedString;
}

export function encryptMsg(msg: string, pubKey: Trytes, secret?: string) {
  const encSecret = secret ? secret : generateSeed(100);
  const payloadEnc = AES.encrypt(msg, encSecret).toString();
  const payloadEncTrytes = asciiToTrytes(payloadEnc);

  const secretEnc: Trytes = encrypt(encSecret, pubKey);
  const msgTrytes = secretEnc + payloadEncTrytes;
  const meta = asciiToTrytes(
    `${secretEnc.length.toString()}-${payloadEncTrytes.length.toString()}`
  );
  return {
    encSecret,
    meta,
    msgTrytes,
  };
}

export async function getPubKeyFromTangle({
  iota,
  address,
}: {
  iota: API;
  address: string;
}) {
  const trans = await iota.getBundle(address);
}
