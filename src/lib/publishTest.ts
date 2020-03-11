import {
  defaultMwm,
  defaultNodeAddress,
  defaultPowApiKey,
  defaultSeedPublisher,
  tagDateFormat,
} from './config';
import { DataPublisher } from './DataPublisher';
const masterSecret = 'IamSecret';
const publisher = new DataPublisher();

async function init() {
  console.log('Using node:', defaultNodeAddress);
  console.log('Using tag format:', tagDateFormat);
  console.log('Using mwm:', defaultMwm);

  await Promise.all([
    publisher.init({
      masterSecret,
      seed: defaultSeedPublisher,
      dataType: 'timestamp',
      powApiKey: defaultPowApiKey,
    }),
  ]);

  console.log('init finished');
  const pubInt = await publisher.run(7000, 50);
  console.log('publisher triggered');
}
init().catch(e => {
  console.log(e);
});
