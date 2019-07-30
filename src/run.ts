/* istanbul ignore file */

import DateTag from './DateTag';
import { fromYears } from './treeCalculation';

const dateStart = new DateTag(2019, 4, 1);
const dateEnd = new DateTag(2020, 5, 3);

fromYears(dateStart, dateEnd).map(e => {
  console.log(e);
  console.log(e.substring(0, 14));
  console.log('year: ' + parseInt(e.substring(0, 14), 2));
  console.log(e.substring(14, 18));
  console.log('Month: ' + parseInt(e.substring(14, 18), 2));
  console.log(e.substring(18, 23));
  console.log('Day: ' + parseInt(e.substring(18, 23), 2));
});
