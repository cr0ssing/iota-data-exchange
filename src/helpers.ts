import DateTag from './DateTag';
import { EFillOptions } from './typings/Constants';
import { EDay, EMonth, EYear } from './typings/Date';

export function dateTagFromBinStr(binStr: string, fill: EFillOptions) {
  const binStrRepl = binStr.replace('X', fill);
  const year = binStrRepl.substring(EYear.posStart, EYear.posEnd);
  const month = binStrRepl.substring(EMonth.posStart, EMonth.posEnd);
  const day = binStrRepl.substring(EDay.posStart, EDay.posEnd);
  const dateTag = new DateTag(
    parseInt(year, 2),
    parseInt(month, 2),
    parseInt(day, 2)
  );
  return dateTag;
}
