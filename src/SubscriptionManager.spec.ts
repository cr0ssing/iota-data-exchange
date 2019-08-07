import { asciiToTrytes } from '@iota/converter';
import SubscriptionManager, { IKeyPair } from './SubscriptionManager';

const masterSecret = 'HELLOWORLD';
describe('Constructor', () => {
  let res: SubscriptionManager;
  beforeEach(() => {
    res = new SubscriptionManager(masterSecret);
  });
  it('should return Manager Object', () => {
    // TODO add Test for Constructor
    expect(true);
  });
  it('should be initilized with keypair', async () => {
    const keypair: IKeyPair = {
      privateKey: new Uint8Array(),
      publicKey: new Uint8Array(),
    };

    const store = new SubscriptionManager(masterSecret, keypair);

    await expect(store.init()).rejects.toThrowError();
  });
  it('should create a keypair', async () => {
    await res.init();
    expect(res.getPubKey()).not.toBe(undefined);
  });
  it('should create no a keypair', async () => {
    expect(res.getPubKey()).toBe(undefined);
  });
  it('should coonect to tangle', async () => {
    res.connectToTangle();
    const nodeInfo = await res.iota.getNodeInfo();
    expect(nodeInfo).not.toBe(undefined);
  });
});
describe('Fetching Access Requests from Tangle', () => {
  let res: SubscriptionManager;
  beforeEach(() => {
    res = new SubscriptionManager(masterSecret);
    res.init();
    res.connectToTangle();
  });

  it('should return a transaction', async () => {
    const trans = await res.fetchSubscriptionRequests();
    const pub = res.getPubKey().toString();

    const pubTryte = asciiToTrytes(pub);
    expect(trans).toBe([]);
  });
});
