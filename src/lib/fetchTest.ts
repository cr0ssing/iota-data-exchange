import {
  defaultDepth,
  defaultMwm,
  defaultNodeAddress,
  defaultPowApiKey,
  defaultSeedPublisher,
  defaultSeedReciever,
  tagDateFormat,
} from './config';
import { DataPublisher } from './DataPublisher';
import { DataReciever } from './DataReciever';
import DateTag from './DateTag';
import { hashFromDatetag, hashListFromDatatags } from './hashingTree';
import MamReaderExtended from './MamReaderExtendet';
import { MAM_MODE, MAM_SECURITY, MamWriter } from '../mam/src';

async function init() {
  console.log('Using node:', defaultNodeAddress);
  console.log('Using tag format:', tagDateFormat);
  console.log('Using mwm:', defaultMwm);

  const masterSecret = 'VerySecret';
  const seed = 'RTZHJFDSTRZUHGFDGHGFDFHGHDHFGHHFGHG';
  const writer = new MamWriter(
    defaultNodeAddress,
    seed,
    MAM_MODE.RESTRICTED,
    'unsecure',
    MAM_SECURITY.LEVEL_1
  );
  const dateTag = new DateTag(2020, 3, 17);
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

  await delay(5000);
  const performance = [];
  for (let i = 0; i < 100; i++) {
    let hrTime = process.hrtime();
    const startTime = hrTime[0] * 1000000 + hrTime[1] / 1000;
    const hash = hashFromDatetag(masterSecret, dateTag);
    hrTime = process.hrtime();
    const endTime = hrTime[0] * 1000000 + hrTime[1] / 1000;
    const sideKeyCalculation = Math.floor(endTime - startTime);

    const reader = new MamReaderExtended({
      hashList: [{ prefix: dateTag.toBinStr(), hash }],
      mode: MAM_MODE.RESTRICTED,
      provider: defaultNodeAddress,
      root,
      sideKey: 'unsecure',
    });
    const resp = await reader.getMessage();
    performance.push({ sideKeyCalculation, ...resp.performance });
  }
  console.log(JSON.stringify(performance));
}

function delay(timeout) {
  return new Promise((res, rej) => {
    setTimeout(() => res(), timeout);
  });
}

init().catch(e => {
  console.log(e);
});
