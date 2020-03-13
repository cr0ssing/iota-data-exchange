import {
  defaultMwm,
  defaultNodeAddress,
  defaultPowApiKey,
  defaultSeedPublisher,
  defaultSeedReciever,
  tagDateFormat,
} from './config';
import { DataPublisher } from './DataPublisher';
import MamReaderExtended from './MamReaderExtendet';
import { MAM_MODE } from 'mam.ts';
import { DataReciever } from './DataReciever';
import { hashListFromDatatags } from './hashingTree';
import DateTag from './DateTag';

const masterSecret = 'IamSecret';
const publisher = new DataPublisher();
const reciever = new DataReciever({ seed: defaultSeedReciever });

async function init() {
  console.log('Using node:', defaultNodeAddress);
  console.log('Using tag format:', tagDateFormat);
  console.log('Using mwm:', defaultMwm);

  await Promise.all([
    publisher.init({
      masterSecret,
      seed: 'RTZHJFDSTRZUHGFDGHGFDFHGHDHFGHHFGHG',
      dataType: 'timestamp',
      powApiKey: defaultPowApiKey,
    }),
  ]);

  const hashlist = hashListFromDatatags(
    masterSecret,
    new DateTag(2020, 3, 13),
    new DateTag(2020, 4, 1)
  );

  console.log('init finished');
  const root = publisher.writer.getNextRoot();
  let hrTime = process.hrtime();
  const startTime = hrTime[0] * 1000000 + hrTime[1] / 1000;
  const txs = await publisher.sentMessage(new Date().toDateString());
  hrTime = process.hrtime();
  const endTime = hrTime[0] * 1000000 + hrTime[1] / 1000;
  console.log('message published');

  await delay(5000);
  const performance = [];
  for (let i = 0; i < 50; i++) {
    const reader = new MamReaderExtended({
      provider: defaultNodeAddress,
      root,
      mode: MAM_MODE.RESTRICTED,
      sideKey: 'unsecure',
      hashList: hashlist
    });
    const resp = await reader.getMessage();
    performance.push(resp.performance);
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
