import {
  defaultSeed,
  defaultSeedOwner,
  defaultSeedPublisher,
  defaultSeedReciever,
} from './config';
import { DataOwner } from './DataOwner';
import DataPublishConnector from './DataPublishConnector';
import { DataPublisher } from './DataPublisher';
import { DataReciever } from './DataReciever';
import DateTag from './DateTag';
import { hashListFromDatatags } from './hashingTree';

const colors = require('colors');
const masterSecret = 'IamSecret';
const publisher = new DataPublisher();
const owner = new DataOwner();
const reciever = new DataReciever({ seed: defaultSeedReciever });
const inits = [
  publisher.init({
    masterSecret,
    seed: defaultSeedPublisher,
    dataType: 'timestamp',
  }),
  owner.init({
    masterSecret,
    seed: defaultSeedOwner,
  }),
  reciever.init(),
];

async function init() {
  await Promise.all(inits);
  console.log('init finished');
  const pubInt = await publisher.run(5000);
  console.log('publisher triggered');
  const connector = new DataPublishConnector({
    masterSecret,
  });
  const hashlist = hashListFromDatatags(
    masterSecret,
    new DateTag(2019, 8, 1),
    new DateTag(2019, 12, 31)
  );
  await connector.connect(publisher.getNextRoot(), hashlist);
  console.log('connector connected');

  owner.addDataConnector({
    conn: connector,
    id: 'Device1',
  });
  const readerInt = setInterval(() => {
    connector
      .getMsg()
      .then(msg => console.log(colors.red(`connector recieved msg: ${msg}`)));
  }, 10000);
  return [pubInt, readerInt];
}

async function run() {
  await reciever.publishPubKey();

  await reciever.requestAccess({
    start: new DateTag(2019, 8, 21),
    end: new DateTag(2019, 12, 10),
    dataType: 1,
    peerAddress: owner.getSubscriptionRequestAddress(),
    peerPubKey: owner.getPubKey(),
    publisherId: '',
  });

  console.log('reciever requested access');
  const msg = await owner.getAccessRequests();

  console.log(`found ${msg.length} requests`);
  const sub = await owner.acceptAccessRequest(msg[0].bundle);

  console.log(
    `accepted Request from ${sub.startDate.toString()} to ${sub.endDate.toString()} `
  );
  const welcomeMsg = await reciever.checkOpenRequests();

  console.log('reciever checks for welcome message');
  console.log(JSON.stringify(welcomeMsg));
  return;
}
init().then(() => {
  run().catch(e => {
    console.log(e);
  });
});
