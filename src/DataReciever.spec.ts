import DataReciever from './DataReciever';
const seed =
  'HEEAXLXPIDUFFTLGNKQQYUNTRRCTYRSFOOFXGQRKNVEPGXWLURNXZPFCBVBCZRAKRMSXAGTNLTXMRPYDC';

const masterSecret = 'HELLOWORLD';

describe('Publish PubKey', () => {
  it('should publish a PubKey in the Tangle', async () => {
    const dataReciever = new DataReciever({ seed });
    await dataReciever.init();
    const msg = dataReciever.publishPubKey();
    expect(msg).toBe('');
  });
});
