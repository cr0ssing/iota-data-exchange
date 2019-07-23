export interface IDateTag {
  year: number;
  month: number;
  day: number;
  hour?: number;
  minute?: number;
  second?: number;
}
export interface IYear {
  value: number;
  months: IMonth[];
}

export interface IMonth {
  value: number;
  days: IDay[];
}

export interface IDay {
  value: number;
  hours: IHour[];
}
export interface IHour {
  value: number;
  seconds: number[];
}
export enum EYear {
  max = 16384,
  min = 0,
  depth = Math.ceil(Math.log2(max)),
}
export enum EMonth {
  max = 15,
  min = 0,
  depth = Math.ceil(Math.log2(max)),
}
export enum EDay {
  max = 31,
  min = 0,
  depth = Math.ceil(Math.log2(max)),
}

export enum EDateTagProps {
  YEAR = 'year',
  MONTH = 'month',
  DAY = 'day',
}
