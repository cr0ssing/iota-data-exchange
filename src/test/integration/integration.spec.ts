import { MAM_SECURITY } from 'mam.ts';
import { DataOwner } from '../../lib/DataOwner';
import DataPublishConnector from '../../lib/DataPublishConnector';
import { DataPublisher } from '../../lib/DataPublisher';
import { DataReciever } from '../../lib/DataReciever';
import DateTag from '../../lib/DateTag';
import { hashListFromDatatags } from '../../lib/hashingTree';
import { generateSeed, parseRequestMessage } from '../../lib/iotaUtils';
import { EDataTypes, IWelcomeMsg } from '../../typings/messages/WelcomeMsg';
jest.setTimeout(60000);

describe('Data ower', () => {
  it.skip('should recieve request message from data reciever', async () => {
    const seedDataRec = generateSeed();
    const dataReciever = new DataReciever({ seed: seedDataRec });
    const drInit = dataReciever.init();

    const masterSecret = 'MYSECRET';
    const seedDataOwn = generateSeed();
    const dataOwnsubscriptionRequestAddress = generateSeed();
    const dataOwner = new DataOwner();
    const dataOwnerIinit = dataOwner.init({
      masterSecret,
      seed: seedDataOwn,
      subscriptionRequestAddress: dataOwnsubscriptionRequestAddress,
    });
    await Promise.all([drInit, dataOwnerIinit]);
    const accesmsg = {
      dataType: EDataTypes.heartRate,
      end: new DateTag(2019, 3, 10),
      peerAddress: dataOwner.getSubscriptionRequestAddress(),
      peerPubKey: dataOwner.getPubKey(),
      start: new DateTag(2019, 1, 5),
      publisherId: '',
    };
    const accessRequest = await dataReciever.requestAccess(accesmsg);
    const dataOwnerRequest = await dataOwner.getAccessRequests();

    expect(JSON.stringify(accessRequest.msg)).toBe(
      JSON.stringify(dataOwnerRequest[0].msg)
    );
    const dataOwnerRequests = await dataOwner.getAccessRequests();
    const subscription = await dataOwner.acceptAccessRequest(
      dataOwnerRequests[0].bundle
    );
    expect(JSON.stringify(subscription.startDate)).toStrictEqual(
      JSON.stringify(accesmsg.start)
    );
    expect(JSON.stringify(subscription.endDate)).toStrictEqual(
      JSON.stringify(accesmsg.end)
    );
    const openReq = await dataReciever.checkOpenRequests();
    expect(dataReciever.requests.active.length).not.toBe(0);
    // expect(openReq.msg.length).toBe(8);
  });
});

describe('Connection between data publisher and Dataower', () => {
  it('should be posible for a Dataowner to read the published data', async () => {
    const masterSecret = 'SomeSecret';
    const seedDataOwn = generateSeed();
    const dataOwnsubscriptionRequestAddress = generateSeed();
    const hashList = hashListFromDatatags(
      masterSecret,
      new DateTag(2019, 1, 1),
      new DateTag(2019, 11, 1)
    );
    const dataOwner = new DataOwner();
    const dataOwnerIinit = dataOwner.init({
      masterSecret,
      seed: seedDataOwn,
      subscriptionRequestAddress: dataOwnsubscriptionRequestAddress,
    });
    const publisherSeed = generateSeed();
    const dataPublisher = new DataPublisher();
    const dataPublisherInit = dataPublisher.init({
      initialSideKey: 'unsecure',
      masterSecret,
      securityLevel: MAM_SECURITY.LEVEL_1,
      seed: publisherSeed,
    });
    await Promise.all([dataOwnerIinit, dataPublisherInit]);
    const startRoot = dataPublisher.getNextRoot();

    const first = await dataPublisher.sentMessage('HelloWorld');
    const next = dataPublisher.getNextRoot();
    const connector = new DataPublishConnector({
      masterSecret,
    });
    dataOwner.addDataConnector({
      conn: connector,
      id: 'Device1',
    });
    await connector.connect(startRoot, hashList);
    const firstmsg = await connector.getMsg();
    expect(firstmsg.msg).toBe('HelloWorld');
  });
});
