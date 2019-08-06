import * as converter from '@iota/converter';
import { EMSGSIZE } from 'constants';
import DateTag from './DateTag';
import DateTagOutOfRange from './errors/DateTagOutOfRange';
import NoHashPrefixFound from './errors/NoHashPrefixFound';
import { hash } from './hashingTree';
import { dateTagFromBinStr } from './helpers';
import { binStrToTrits } from './ternaryStringOperations';
import { EFillOptions } from './typings/Constants';
import { EDay, EMonth, EYear } from './typings/Date';
import { IHashItem } from './typings/HashStore';

export default class HashStore {
  private hashList: IHashItem[];
  private minDate: DateTag;
  private maxDate: DateTag;
  constructor(hashList: IHashItem[]) {
    this.hashList = hashList;
    this.setMinMaxRange();
  }
  /**
   * getHashList
   */
  public getHashList() {
    return this.hashList;
  }
  /**
   * getMinDate
   */
  public getMinDate() {
    return this.minDate;
  }
  /**
   * getMinDate
   */
  public getMaxDate() {
    return this.maxDate;
  }
  /**
   * getHashFromDateTag
   * @param tag Datetag
   */
  public getHashPrefixFromDateTag(tag: DateTag): IHashItem {
    if (tag.compare(this.minDate) >= 0 && tag.compare(this.maxDate) <= 0) {
      const dateBin = tag.toBinStr();
      // find the longest common prefix
      for (let index = 0; index < dateBin.length; index++) {
        const element = this.hashList.filter(e =>
          e.prefix.startsWith(dateBin.substring(0, dateBin.length - index))
        );
        if (element.length > 0) {
          // TODO Maybe length is always 1?
          return element[0];
        }
      }
      throw new NoHashPrefixFound('No hash prefix found');
    } else {
      throw new DateTagOutOfRange('DateTag is not in range of this store');
    }
  }

  /**
   * Calculates a Deycryption Key from a DateTag
   */
  public getKeyFromDatetag(d: DateTag) {
    const prefixItem = this.getHashPrefixFromDateTag(d);
    const prefixItemPrefix = prefixItem.prefix.replace(/X/g, '');
    const dateBin = d.toBinStr();
    if (prefixItemPrefix === dateBin) {
      return prefixItem.hash;
    }
    // extract the binary values that are needed for hashing
    const binToAppend = dateBin.substring(prefixItemPrefix.length);
    const prefixTrits = converter.trytesToTrits(prefixItem.hash);
    const appenTrits = binStrToTrits(binToAppend);
    const key = hash(prefixTrits, appenTrits);
    return converter.trytes(key);
  }

  /**
   * Set the minmal and maximal Daterange from the store
   */
  private setMinMaxRange() {
    const sortedList = this.hashList.sort((a, b) => {
      return a.prefix < b.prefix ? -1 : 1;
    });
    this.minDate = dateTagFromBinStr(sortedList[0].prefix, EFillOptions.MIN);
    this.maxDate = dateTagFromBinStr(
      sortedList[sortedList.length - 1].prefix,
      EFillOptions.MAX
    );
  }
}
