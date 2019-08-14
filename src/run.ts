/* istanbul ignore file */

import DateTag from './DateTag';
import { fromYears } from './treeCalculation';
import { EDataTypes, IRequestMsg } from './typings/messages/WelcomeMsg';

const dateStart = new DateTag(2019, 4, 1);
const dateEnd = new DateTag(2020, 5, 3);
const requestMsg: IRequestMsg = {
  dataType: EDataTypes.heartRate,
  endDate: dateEnd,
  nextAddress: 'ABS',
  pubKeyAddress: 'PUB',
  startDate: dateStart,
};

console.log(requestMsg);
