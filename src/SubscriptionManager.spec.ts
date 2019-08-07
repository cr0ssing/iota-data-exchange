import SubscriptionManager from './SubscriptionManager';

describe('Constructor', () => {
  let res;
  beforeEach(() => {
    res = new SubscriptionManager();
  });
  it('should return Manager Object', () => {
    // TODO add Test for Constructor
    expect(true);
  });
  it('should create a keypair', async () => {
    await res.init();
    expect(res.getPubKey()).not.toBe(undefined);
  });
  it('should create no a keypair', async () => {
    expect(res.getPubKey()).toBe(undefined);
  });
});
