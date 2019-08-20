import { MamReader } from 'mam.ts/typings/src';
import DataPublisher from './DataPublisher';
import DateTag from './DateTag';
const masterSecret = 'SomeSecret';
const seed =
  'HEEAXLXPIDUFFTLGNKQQYUNTRRCTYRSFOOFXGQRKNVEPGXWLURNXZPFCBVBCZRAKRMSXAGTNLTXMRPYDC';
describe('Obkect initilizilation', () => {
  it('should throw erroro because not initilized ', async () => {
    const writer = new DataPublisher();
    await expect(writer.sentMessage('')).rejects.toThrowError();
  });
});
describe('Publish message', () => {
  it('publish a message encypted', async () => {
    jest.setTimeout(10000);
    const dataPublisher = new DataPublisher();
    await dataPublisher.init({
      masterSecret,
      securityLevel: 1,
      seed,
      initialSideKey: 'unsec',
    });
    const date = new Date();
    const dateTag = new DateTag(
      date.getFullYear(),
      date.getMonth() + 1,
      date.getDate()
    );
    const res = await dataPublisher.sentMessage('HelloWorld');
    expect(res.length > 0).toBe(true);
  });
});
