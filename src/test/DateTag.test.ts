import DateTag from '../DateTag';

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
