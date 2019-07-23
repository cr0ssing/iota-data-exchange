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
