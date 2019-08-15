import DataOwner from '../DataOwner';
import DataReciever from '../DataReciever';
import DateTag from '../DateTag';
import { generateSeed, parseRequestMessage } from '../iotaUtils';
import { EDataTypes, IWelcomeMsg } from '../typings/messages/WelcomeMsg';
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
      dataType: EDataTypes.heartRate,
      end: new DateTag(2019, 3, 10),
      peerAddress: dataOwner.getSubscriptionRequestAddress(),
      peerPubKey: dataOwner.getPubKey(),
      start: new DateTag(2019, 1, 5),
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
    expect(openReq.bundle).not.toBe(undefined);
    expect(openReq.msg.length).toBe(8);
  });
});
