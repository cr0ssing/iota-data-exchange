import { asciiToTrytes } from '@iota/converter';
import { Address, API, Transfer } from '@iota/core/typings/core/src';
import { Trytes } from '@iota/core/typings/types';

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
  message: string,
  tag: string,
  depth: number = 3,
  mwm: number = 14
) {
  const transfers: Transfer[] = [
    {
      address,
      message: asciiToTrytes(message),
      tag: asciiToTrytes(tag),
      value: 0,
    },
  ];
  try {
    const prepTransfersTrytes = await iota.prepareTransfers(seed, transfers);
    const attachedBundle = await iota.sendTrytes(
      prepTransfersTrytes,
      depth /*depth*/,
      mwm /*MWM*/
    );
    return attachedBundle;
  } catch (error) {
    throw error;
  }
}
