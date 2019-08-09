import { asciiToTrytes } from '@iota/converter';
import { notDeepEqual } from 'assert';
import DateTag from './DateTag';
import SubscriptionManager, { IKeyPair } from './SubscriptionManager';
import { ISubscription } from './SubscriptionStore';
import { EDataTypes } from './typings/messages/WelcomeMsg';

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
    let msgs = [];
    trans.forEach((val, key, map) => {
      const decrMsg = res.decryptRequestBundel(val);
      msgs = [...msgs, decrMsg];
    });
    // expect(trans).toBe([]);
  });
});
describe('Sending Request accept message', () => {
  it('should create a valid message', async () => {
    const manager = new SubscriptionManager(masterSecret);
    await manager.init();
    await manager.connectToTangle();
    const subscription: ISubscription = {
      dataType: EDataTypes.heartRate,
      endDate: new DateTag(2019, 9, 10),
      id: 'ABC',
      pubKey:
        'AAAAAWORLDHELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDDDKYVEVAEX',
      startDate: new DateTag(2019, 7, 15),
    };
    const msg = await manager.sentRequestAcceptMsg(subscription);
    expect(msg).not.toBe('');
  });
  it('should encrypt tag an message', async () => {
    const manager = new SubscriptionManager(masterSecret);
    const tag = 'FCWBFC9CYBPBYBYBPBVBZBPBCB9';
    const secret = 'SomeSecret';
    await manager.init();
    await manager.connectToTangle();
    const subscription: ISubscription = {
      dataType: EDataTypes.heartRate,
      endDate: new DateTag(2019, 9, 10),
      id: 'ABC',
      pubKey:
        'AAAAAWORLDHELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDDDKYVEVAEX',
      startDate: new DateTag(2019, 7, 15),
    };
    const msg = await manager.sentRequestAcceptMsg(subscription);
    const decTag = await manager.decrypt(msg[0].tag.replace(/9*$/g, ''));
    expect(msg).toBe('');
  });
});
