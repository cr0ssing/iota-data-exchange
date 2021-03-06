import { asciiToTrytes } from '@iota/converter';
import {
  EDay,
  EHour,
  EMinute,
  EMonth,
  ESecond,
  EYear,
  IDateTag,
  IMonth,
  IYear,
} from '../typings/Date';
import { buildStrBin } from './binaryStringOperations';
/**
 * Date tag
 * @author Raphael Manke
 */
export default class DateTag implements IDateTag {
  public static fromString(str: string) {
    if (str.length >= 8) {
      const year = parseInt(str.substring(0, 4), 10);
      const month = parseInt(str.substring(4, 6), 10);
      const day = parseInt(str.substring(6, 8), 10);
      const hour =
        str.length >= 10 ? parseInt(str.substring(8, 10), 10) : undefined;
      const minute =
        str.length >= 12 ? parseInt(str.substring(10, 12), 10) : undefined;
      const second =
        str.length >= 14 ? parseInt(str.substring(12, 14), 10) : undefined;
      return new DateTag(year, month, day, hour, minute, second);
    } else {
      throw Error(`${str.length} is an invalid string size`);
    }
  }
  public year: number;
  public month: number;
  public day: number;
  public hour?: number;
  public minute?: number;
  public second?: number;
  /**
   * Creates a Date Object
   * @param year Year of the Date
   * @param month Month of the Date
   * @param day Day of the Date
   * @param hour Hour of the Date
   * @param minute Minute of the Date
   * @param second Second of the Date
   */
  constructor(
    year: number,
    month: number,
    day: number,
    hour?: number,
    minute?: number,
    second?: number
  ) {
    this.year = year;
    this.month = month;
    this.day = day;
    this.hour = hour ? hour : null;
    this.minute = minute ? minute : null;
    this.second = second ? second : null;
  }
  /**
   * toString
   */
  public toString() {
    const year = this.year.toString();
    const month =
      this.month < 10 ? '0' + this.month.toString() : this.month.toString();
    const day = this.toStringHelper(this.day);
    const hour = this.toStringHelper(this.hour);
    const minute = this.toStringHelper(this.minute);
    const second = this.toStringHelper(this.second);
    // TODO Extend to support hours and minutes
    return year + month + day + hour + minute + second;
  }
  /**
   * toTrytes
   */
  public toTrytes() {
    return asciiToTrytes(this.toString());
  }
  /**
   * Get binary string of a date
   */
  public toBinStr() {
    const year = this.toBinStringHelper(this.year, EYear.depth);
    const month = this.toBinStringHelper(this.month, EMonth.depth);
    const day = this.toBinStringHelper(this.day, EDay.depth);
    const hour = this.toBinStringHelper(this.hour, EHour.depth);
    const minute = this.toBinStringHelper(this.minute, EMinute.depth);
    const second = this.toBinStringHelper(this.second, ESecond.depth);
    // TODO Extend to support hours and minutes
    return year + month + day + hour + minute + second;
  }
  /**
   * compare
   */
  public compare(other: DateTag) {
    // TODO Add minutes and seconds
    if (this.year < other.year) {
      return -1;
    } else if (this.year > other.year) {
      return 1;
    } else {
      if (this.month < other.month) {
        return -1;
      } else if (this.month > other.month) {
        return 1;
      } else {
        if (this.day < other.day) {
          return -1;
        } else if (this.day > other.day) {
          return 1;
        } else {
          return 0;
        }
      }
    }
  }
  private toStringHelper(number: number | undefined): string {
    if (!number) {
      return '';
    } else {
      return number < 10 ? '0' + number.toString() : number.toString();
    }
  }
  private toBinStringHelper(number: number | undefined, depth: number): string {
    if (!number) {
      return '';
    } else {
      return buildStrBin(number.toString(2), depth);
    }
  }
}
