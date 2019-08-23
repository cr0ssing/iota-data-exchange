import {
  asciiToTrytes,
  bytesToTrits,
  tritsToBytes,
  tritsToTrytes,
  trytesToAscii,
  trytesToTrits,
  valueToTrits,
} from '@iota/converter';
import { Tag, Transaction, Trytes } from '@iota/core/typings/types';
import { StringDecoder } from 'string_decoder';
import DateTag from './DateTag';
import { hashCurl } from './hashingTree';
import { asciiToTrits } from './ternaryStringOperations';
import { EFillOptions } from '../typings/Constants';
import { EDay, EMonth, EYear } from '../typings/Date';

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

export function tagTrytesToDateTag(trytes: Trytes) {
  let stripedTrytes = trytes.replace(/9*$/, '');
  if (stripedTrytes.length % 2) {
    stripedTrytes = stripedTrytes + '9';
  }
  const tagPlain = trytesToAscii(stripedTrytes);
  return tagPlain;
}

export function dateTagFromTxTag(trytes: Trytes) {
  const tagString = tagTrytesToDateTag(trytes);
  const date = new DateTag(
    parseInt(tagString.substr(0, 4), 10),
    parseInt(tagString.substr(4, 2), 10),
    parseInt(tagString.substr(6, 2), 10)
  );
  return date;
}
