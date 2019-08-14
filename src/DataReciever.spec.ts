import { createKeyPair, toTrytes } from '@decentralized-auth/ntru';
import DataReciever from './DataReciever';
import DateTag from './DateTag';
import { generateSeed } from './iotaUtils';
import { EDataTypes } from './typings/messages/WelcomeMsg';
const seed =
  'HEEAXLXPIDUFFTLGNKQQYUNTRRCTYRSFOOFXGQRKNVEPGXWLURNXZPFCBVBCZRAKRMSXAGTNLTXMRPYDC';

const masterSecret = 'HELLOWORLD';
jest.setTimeout(30000);
describe('Publish PubKey', () => {
  it('should publish a PubKey in the Tangle', async () => {
    const dataReciever = new DataReciever({ seed });
    await dataReciever.init();
    const msg = await dataReciever.publishPubKey();
    const pubAdd = dataReciever.getPubKeyAddress();
    expect(msg).not.toBe('');
    expect(msg).toStrictEqual(pubAdd);
  });
  it('should throw error when pubKey address is not set but accesed', () => {
    const dataReciever = new DataReciever({ seed });
    expect(() => dataReciever.getPubKeyAddress()).toThrowError(
      'no public key address found'
    );
  });
});
describe('Publish a access request', () => {
  it('should publlish a welcome message', async () => {
    const peerKeyPair = await createKeyPair(generateSeed());
    const peerPubKey = toTrytes(peerKeyPair.public);
    const dataReciever = new DataReciever({ seed });
    await dataReciever.init();
    const start = new DateTag(2019, 10, 15);
    const end = new DateTag(2019, 11, 15);
    const peerAddress = generateSeed();
    const resp = await dataReciever.requestAccess({
      start,
      end,
      dataType: EDataTypes.heartRate,
      peerAddress,
      peerPubKey,
    });
    expect(resp.length).toBe(2);
  });
});
describe('Checking open requests', () => {
  it('should return error that no open request exist', async () => {
    const dataReciever = new DataReciever({ seed });
    await expect(() => dataReciever.checkOpenRequests()).rejects;
  });
});
