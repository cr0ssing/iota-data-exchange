import {
  asciiToTrytes,
  bytesToTrits,
  tritsToBytes,
  tritsToTrytes,
  trytesToAscii,
  trytesToTrits,
  valueToTrits,
} from '@iota/converter';
import { Tag, Transaction } from '@iota/core/typings/types';
import { ntru } from 'ntru';
import { StringDecoder } from 'string_decoder';
import DateTag from './DateTag';
import { hashCurl } from './hashingTree';
import { asciiToTrits } from './ternaryStringOperations';
import { EFillOptions } from './typings/Constants';
import { EDay, EMonth, EYear } from './typings/Date';

export function dateTagFromBinStr(binStr: string, fill: EFillOptions) {
  const binStrRepl = binStr.replace('X', fill);
  const year = binStrRepl.substring(EYear.posStart, EYear.posEnd);
  const month = binStrRepl.substring(EMonth.posStart, EMonth.posEnd);
  const day = binStrRepl.substring(EDay.posStart, EDay.posEnd);
  const dateTag = new DateTag(
    parseInt(year, 2),
    parseInt(month, 2),
    parseInt(day, 2)
  );
  return dateTag;
}

export function uniqueBundelHashes(transactions: Transaction[]) {
  return [...new Set(transactions.map(t => t.bundle))];
}

export function groupBy(list, keyGetter) {
  const map = new Map();
  list.forEach(item => {
    const key = keyGetter(item);
    const collection = map.get(key);
    if (!collection) {
      map.set(key, [item]);
    } else {
      collection.push(item);
    }
  });
  return map;
}

export async function encryptTag(
  secret: string,
  pubKey: Uint8Array,
  privKey: Uint8Array
): Promise<Tag> {
  const secretTrits = asciiToTrits(secret);
  const ntruMaxLenght = await ntru.plaintextBytes;
  const secretHash = hashCurl(secretTrits, null, ntruMaxLenght);
  const secretHashStr = tritsToTrytes(secretHash);
  const secretBytes = tritsToBytes(secretHash);
  const secretUint = Uint8Array.from(secretBytes);
  const encTag = await ntru.encrypt(secretHashStr, pubKey);
  const encTagStr = encTag.toString();
  const encTagJsonString = JSON.stringify(encTag);
  const encTagTrytes = asciiToTrytes(encTagStr);
  let encTagStrArr = [];
  encTag.forEach(element => {
    encTagStrArr = [...encTagStrArr, valueToTrits(element)];
  });
  const tagBuffer = Buffer.from(encTag);
  const utf8decoder = new StringDecoder('ascii');
  const tagUft8 = utf8decoder.write(tagBuffer);
  const tagUtf8Ternary = asciiToTrytes(tagUft8);
  const tagEncTrits = bytesToTrits(tagBuffer);
  const tagEncTrytes = tritsToTrytes(tagEncTrits);
  const tagLength = tagEncTrytes.length;

  // debug
  const tagDecAscii = trytesToAscii(tagEncTrytes);
  const compareEncDec = tagUft8 === tagDecAscii;
  const tagReduced = tagEncTrytes.replace(/9*$/g, '') + '9';
  const tagBytes = tritsToBytes(trytesToTrits(tagReduced));
  const encdecTag = await ntru.decrypt(tagBytes, privKey);

  return tagEncTrytes;
}
export async function decryptTag(
  tag: Tag,
  privKey: Uint8Array
): Promise<string> {
  const tagReduced = tag.replace(/9*$/g, '') + '9';
  const tagBytes = tritsToBytes(trytesToTrits(tagReduced));
  const encdecTag = await ntru.decrypt(tagBytes, privKey);
  const decBuffer = Buffer.from(encdecTag);
  const decTrits = bytesToTrits(decBuffer);
  const decTrytes = tritsToTrytes(decTrits);
  const decString = trytesToAscii(decTrytes);

  return decString;
}
