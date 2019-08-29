import DateTag from './DateTag';

describe('DateTag', () => {
  const year = 2019;
  const month = 6;
  const day = 15;
  const hour = 12;
  const minute = 30;
  const second = 10;

  it('generate a new Object with minimal values', () => {
    const dateTag = new DateTag(year, month, day);

    expect(dateTag.year).toBe(year);
    expect(dateTag.month).toBe(month);
    expect(dateTag.day).toBe(day);
    expect(dateTag.hour).toBe(null);
    expect(dateTag.minute).toBe(null);
    expect(dateTag.second).toBe(null);
  });
  it('generate a new Object with all values', () => {
    const dateTag = new DateTag(year, month, day, hour, minute, second);

    expect(dateTag.year).toBe(year);
    expect(dateTag.month).toBe(month);
    expect(dateTag.day).toBe(day);
    expect(dateTag.hour).toBe(hour);
    expect(dateTag.minute).toBe(minute);
    expect(dateTag.second).toBe(second);
  });
});
describe('Function of Datetage', () => {
  it('should return binary representation of a datetag', () => {
    const date = new DateTag(2019, 5, 10);
    const binStr = '00011111100011010101010';
    const res = date.toBinStr();
    expect(res).toStrictEqual(binStr);
  });
  it('should compare two dateTag where year 1 < year 2', () => {
    const date1 = new DateTag(2019, 5, 10);
    const date2 = new DateTag(2020, 5, 10);
    const res = date1.compare(date2);
    expect(res).toBe(-1);
  });
  it('should compare two dateTag where year 1 = year 2', () => {
    const date1 = new DateTag(2019, 5, 10);
    const date2 = new DateTag(2019, 5, 10);
    const res = date1.compare(date2);
    expect(res).toBe(0);
  });
  it('should compare two dateTag where year 1 > year 2', () => {
    const date1 = new DateTag(2020, 5, 10);
    const date2 = new DateTag(2019, 5, 10);
    const res = date1.compare(date2);
    expect(res).toBe(1);
  });
  it('should compare two dateTag where month 1 < month 2', () => {
    const date1 = new DateTag(2019, 4, 10);
    const date2 = new DateTag(2019, 5, 10);
    const res = date1.compare(date2);
    expect(res).toBe(-1);
  });
  it('should compare two dateTag where month 1 = month 2', () => {
    const date1 = new DateTag(2019, 4, 10);
    const date2 = new DateTag(2019, 4, 10);
    const res = date1.compare(date2);
    expect(res).toBe(0);
  });
  it('should compare two dateTag where month 1 > month 2', () => {
    const date1 = new DateTag(2019, 6, 10);
    const date2 = new DateTag(2019, 4, 10);
    const res = date1.compare(date2);
    expect(res).toBe(1);
  });
  it('should compare two dateTag where day 1 < day 2', () => {
    const date1 = new DateTag(2019, 4, 9);
    const date2 = new DateTag(2019, 4, 10);
    const res = date1.compare(date2);
    expect(res).toBe(-1);
  });
  it('should compare two dateTag where day 1 = day 2', () => {
    const date1 = new DateTag(2019, 4, 9);
    const date2 = new DateTag(2019, 4, 9);
    const res = date1.compare(date2);
    expect(res).toBe(0);
  });
  it('should compare two dateTag where day 1 > day 2', () => {
    const date1 = new DateTag(2019, 4, 10);
    const date2 = new DateTag(2019, 4, 9);
    const res = date1.compare(date2);
    expect(res).toBe(1);
  });
});
describe('ToString concertion', () => {
  it('should return string with zeros if month/day is less than 10', () => {
    const date = new DateTag(2019, 5, 5);
    const dateStr = date.toString();
    expect(dateStr).toBe('20190505');
  });
  it('should return string without zeros if month/day is greater than 10', () => {
    const date = new DateTag(2019, 10, 15);
    const dateStr = date.toString();
    expect(dateStr).toBe('20191015');
  });
});
describe('fromString convertion', () => {
  it('should be the same with  single number month and day', () => {
    const dateStr = '20190808';
    const dateObj = DateTag.fromString(dateStr);
    expect(dateObj.year).toBe(2019);
    expect(dateObj.month).toBe(8);
    expect(dateObj.day).toBe(8);
    expect(dateObj.toString()).toBe(dateStr);
  });
  it('should be the same with  double number month and day', () => {
    const dateStr = '20191115';
    const dateObj = DateTag.fromString(dateStr);
    expect(dateObj.year).toBe(2019);
    expect(dateObj.month).toBe(11);
    expect(dateObj.day).toBe(15);
    expect(dateObj.toString()).toBe(dateStr);
  });
  it('should be the same with  double number month and single number  day', () => {
    const dateStr = '20191001';
    const dateObj = DateTag.fromString(dateStr);
    expect(dateObj.year).toBe(2019);
    expect(dateObj.month).toBe(10);
    expect(dateObj.day).toBe(1);
    expect(dateObj.toString()).toBe(dateStr);
  });
  it('should be the same with  single number month and double number  day', () => {
    const dateStr = '20190110';
    const dateObj = DateTag.fromString(dateStr);
    expect(dateObj.year).toBe(2019);
    expect(dateObj.month).toBe(1);
    expect(dateObj.day).toBe(10);
    expect(dateObj.toString()).toBe(dateStr);
  });
});
