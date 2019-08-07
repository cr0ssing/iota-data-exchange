import DateTag from './DateTag';
import SubscriptionStore, { ISubscription } from './SubscriptionStore';
import { EDataTypes } from './typings/messages/WelcomeMsg';
// using rewire to get into private resources
describe('Constructor', () => {
  it('should return an empty Store', () => {
    expect(() => {
      const store = new SubscriptionStore([]);
    }).not.toThrowError();
  });
});
describe('Add Subbscription', () => {
  const store = new SubscriptionStore([]);

  it('should add a new Subscription', () => {
    const subscript: ISubscription = {
      dataType: EDataTypes.heartRate,
      endDate: new DateTag(2019, 10, 13),
      id: 1,
      pubKey: 'PUBKEY',
      startDate: new DateTag(2019, 10, 12),
    };
    store.addSubscription(subscript);
    expect(store.getSubscriptions()).toStrictEqual([subscript]);
  });
});
