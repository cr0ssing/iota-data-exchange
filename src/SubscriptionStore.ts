import DateTag from './DateTag';
import { EDataTypes } from './typings/messages/WelcomeMsg';

export default class SubscriptionStore {
  private subs: ISubscription[];
  constructor(subs: ISubscription[]) {
    this.subs = subs;
  }
  /**
   * getSubscriptions
   */
  public getSubscriptions() {
    return this.subs;
  }
  /**
   * addSubscription
   */
  public addSubscription(s: ISubscription): void {
    this.subs = [...this.subs, s];
  }
}

export interface ISubscription {
  startDate: DateTag;
  endDate: DateTag;
  dataType: EDataTypes;
  pubKey: string;
  responseAddress?: string;
}
