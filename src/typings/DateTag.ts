export interface DateTagInterface {
    year: number;
    month: number;
    day: number;
    hour?: number;
    minute?: number;
    second?: number;

}
export interface YearInterface {
    value: number;
    months: MonthInterface[];
}

export interface MonthInterface{
    value: number;
    days: DayInterface[];
}

export interface DayInterface{
    value: number;
    hours: HourInterface[];
}
export interface HourInterface{
    value: number;
    seconds: number[]
}