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
  /**
   * removeSubscription
   */
  public removeSubscription(id: string): void {
    this.subs = this.subs.filter(e => e.id !== id);
  }
}

export interface ISubscription {
  id: string;
  startDate: DateTag;
  endDate: DateTag;
  dataType: EDataTypes;
  pubKey: string;
}
