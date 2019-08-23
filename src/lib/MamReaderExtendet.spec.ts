import { MAM_MODE, MAM_SECURITY, MamWriter } from 'mam.ts';
import {
  defaultDepth,
  defaultMwm,
  defaultNodeAddress,
  defaultSeed,
} from './config';
import DateTag from './DateTag';
import { hashFromDatetag } from './hashingTree';
import MamReaderExtended from './MamReaderExtendet';
jest.setTimeout(60000);

describe('Extended Reader', () => {
  it('should decrypt the tag and set the sidekey', async () => {
    const masterSecret = 'VerySecret';
    this.seed = defaultSeed;
    const writer = new MamWriter(
      defaultNodeAddress,
      defaultSeed,
      MAM_MODE.RESTRICTED,
      'unsecure',
      MAM_SECURITY.LEVEL_1
    );
    const dateTag = new DateTag(2019, 8, 10);
    const tag = dateTag.toTrytes();
    writer.setTag(tag);
    const sideKey = hashFromDatetag(masterSecret, dateTag);
    const firstroot = writer.getNextRoot();
    writer.changeMode(MAM_MODE.RESTRICTED, sideKey);
    const changedroot = writer.getNextRoot();
    await writer.catchUpThroughNetwork();
    const root = writer.getNextRoot();
    const mamMsg: {
      payload: string;
      root: string;
      address: string;
    } = writer.create('HelloWorld');
    const attachedMsg = await writer.attach(
      mamMsg.payload,
      mamMsg.address,
      defaultDepth,
      defaultMwm
    );

    const afterroot = writer.getNextRoot();

    const reader = new MamReaderExtended({
      provider: defaultNodeAddress,
      hashList: [{ prefix: dateTag.toBinStr(), hash: sideKey }],
      mode: MAM_MODE.RESTRICTED,
      root,
      sideKey: 'unsecure',
    });
    const retrievedMsg = await reader.getMessage();
    expect(retrievedMsg).toBe('HelloWorld');
  });
});
