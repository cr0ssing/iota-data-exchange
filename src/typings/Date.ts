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
  posStart = 0,
  posEnd = depth + posStart,
}
export enum EMonth {
  max = 15,
  min = 0,
  depth = Math.ceil(Math.log2(max)),
  posStart = 14,
  posEnd = 18,
}
export enum EDay {
  max = 31,
  min = 0,
  depth = Math.ceil(Math.log2(max)),
  posStart = 18,
  posEnd = 24,
}
export enum EHour {
  max = 31,
  min = 0,
  depth = Math.ceil(Math.log2(max)),
  posStart = 24,
  posEnd = 30,
}
export enum EMinute {
  max = 64,
  min = 0,
  depth = Math.ceil(Math.log2(max)),
  posStart = 30,
  posEnd = 37,
}
export enum ESecond {
  max = 64,
  min = 0,
  depth = Math.ceil(Math.log2(max)),
  posStart = 37,
  posEnd = 44,
}

export enum EDateTagProps {
  YEAR = 'year',
  MONTH = 'month',
  DAY = 'day',
  HOUR = 'hour',
  MINUTE = 'minute',
  SECOND = 'second',
}
