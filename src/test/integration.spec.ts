import DataOwner from '../DataOwner';
import DataReciever from '../DataReciever';
import DateTag from '../DateTag';
import { generateSeed } from '../iotaUtils';
import { EDataTypes } from '../typings/messages/WelcomeMsg';
jest.setTimeout(60000);

describe('Data ower', () => {
  it('should recieve request message from data reciever', async () => {
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
      start: new DateTag(2019, 1, 5),
      end: new DateTag(2019, 3, 10),
      dataType: EDataTypes.heartRate,
      peerAddress: dataOwner.getSubscriptionRequestAddress(),
      peerPubKey: dataOwner.getPubKey(),
    };
    const accessRequest = await dataReciever.requestAccess(accesmsg);
    const dataOwnerRequests = await dataOwner.getAccessRequests();
    const res = dataOwnerRequests.values().next().value;
    const a = accessRequest.map(e => e.hash).sort();
    const b = res.map(e => e.hash).sort();
    expect(a).toStrictEqual(b);
    const decReq = await dataOwner.decryptRequests();

    const req = dataReciever.requests.open[0].msg;
    expect(decReq[0]).toBe(JSON.stringify(req));
  });
});
