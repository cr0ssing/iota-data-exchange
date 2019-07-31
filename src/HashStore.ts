import { EMSGSIZE } from 'constants';
import DateTag from './DateTag';
import { dateTagFromBinStr } from './helpers';
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
  public getHashFromDateTag(tag: DateTag): IHashItem[] {
    if (tag.compare(this.minDate) >= 0 && tag.compare(this.maxDate) <= 0) {
      const dateBin = tag.toBinStr();
      for (let index = 0; index < dateBin.length; index++) {
        const element = this.hashList.filter(e =>
          e.prefix.startsWith(dateBin.substring(0, dateBin.length - index))
        );
        if (element.length > 0) {
          return element;
        }
      }
      throw new Error('No hash prefix found');
    } else {
      throw new Error('DateTag is not in range of this store');
    }
  }
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
