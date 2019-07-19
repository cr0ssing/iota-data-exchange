import { DateTagInterface, YearInterface, MonthInterface } from "./typings/DateTag";

export default class DateTag implements DateTagInterface {
    getPath() {
        return this.year.toString(2) + this.month.toString(2) + this.day.toString(2)
    }
    year: number;
    month: number;
    day: number;
    hour?: number;
    minute?: number;
    second?: number;
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
}


export class Year implements YearInterface{
    value: number;    
    months: MonthInterface[];
    

}

