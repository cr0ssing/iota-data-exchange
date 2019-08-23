import DateTag from '../../lib/DateTag';
import { IHashItem } from '../HashStore';

export interface IWelcomeMsg {
  hashList: IHashItem[];
}
export interface IRequestMsg {
  startDate: DateTag;
  endDate: DateTag;
  dataType: EDataTypes;
  pubKeyAddress: string;
  nextAddress: string;
}

export interface IPubKey {}
export enum EDataTypes {
  heartRate,
}
