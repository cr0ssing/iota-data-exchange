import { buildStrBin } from './binaryStringOperations';
import { EDay, EMonth, EYear, IDateTag, IMonth, IYear } from './typings/Date';
/**
 * Date tag
 * @author Raphael Manke
 */
export default class DateTag implements IDateTag {
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
    (this.year = year),
      (this.month = month),
      (this.day = day),
      (this.hour = hour ? hour : null),
      (this.minute = minute ? minute : null),
      (this.second = second ? second : null);
  }
  /**
   * Get binary string of a date
   */
  public toBinStr() {
    const year = buildStrBin(this.year.toString(2), EYear.depth);
    const month = buildStrBin(this.month.toString(2), EMonth.depth);
    const day = buildStrBin(this.day.toString(2), EDay.depth);
    // TODO Extend to support hours and minutes
    return year + month + day;
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
}
