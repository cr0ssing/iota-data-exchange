// import express = require("express");

import { createKeyPair, toTrytes } from '@decentralized-auth/ntru';
import * as cors from 'cors';
import * as express from 'express';
import { DataOwner, DataPublisher, DataReciever } from './lib';
import { defaultPowApiKey, defaultPublishIntervall } from './lib/config';
import DataPublishConnector from './lib/DataPublishConnector';
import DateTag from './lib/DateTag';
import { hashFromDatetag, hashListFromDatatags } from './lib/hashingTree';
import { generateSeed } from './lib/iotaUtils';
const app = express();

const publisherStore: Map<string, DataPublisher> = new Map();
const ownerStore: Map<string, DataOwner> = new Map();
const recieverStore: Map<string, DataReciever> = new Map();

app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(cors());

app.get('/', (req, res) => {
  return res.send('HelloWorld');
});

app.post('/getKeyPair', (req, res) => {
  const string = toTrytes(createKeyPair(req.body.seed).public);
  console.log(req.body);
  return res.send(string);
});

app.get('/publisher/all', (req, res) => {
  try {
    // res.json({ key: 'val' });
    res.json(Array.from(publisherStore).map(e => itemToJson(e[1], e[0])));
  } catch (error) {
    console.log(error);
    res.send(error);
  }
});
app.post('/publisher/add', async (req, res) => {
  try {
    const owner = ownerStore.get(req.body.peer);
    const pub = new DataPublisher();

    await pub.init({
      masterSecret: req.body.masterSecret,
      seed: req.body.seed,
      dataType: req.body.dataType,
      fitbitAccessToken: req.body.fitbitAccessToken,
      fitbitUserId: req.body.fitbitUserId,
      powApiKey: defaultPowApiKey,
    });
    const connector = new DataPublishConnector({
      masterSecret: req.body.masterSecret,
    });
    await connector.connect(
      pub.getNextRoot(),
      hashListFromDatatags(
        req.body.masterSecret,
        new DateTag(2019, 1, 1),
        new DateTag(2020, 12, 31)
      )
    );
    owner.addDataConnector({
      conn: connector,
      id: req.body.id,
    });
    publisherStore.set(req.body.id, pub);

    return res.json(itemToJson(pub, req.body.id));
  } catch (error) {
    console.log(error);
  }
});
app.get('/publisher/get', (req, res) => {
  try {
    const pub = publisherStore.get(req.query.id);
    return res.json(itemToJson(pub, req.body.id));
  } catch (error) {
    console.log(error);
  }
});
app.get('/getDataPublisherMessages', (req, res) => {
  try {
    const pub = publisherStore.get(req.query.id);
    return res.json(pub.getMessageAddresses());
  } catch (error) {
    console.log(error);
  }
});

app.post('/publisher/start/', async (req, res) => {
  try {
    const pub = publisherStore.get(req.body.id);
    const inte = await pub.run(defaultPublishIntervall);
    return res.json(itemToJson(pub, req.body.id));
  } catch (error) {
    console.log(error);

    return res.json(error);
  }
});
app.post('/publisher/stop/', async (req, res) => {
  try {
    const pub = publisherStore.get(req.body.id);
    const inte = pub.stop();
    return res.json(itemToJson(pub, req.body.id));
  } catch (error) {
    return res.json(error);
  }
});

// ---------------------------------------------------------
app.post('/owner/add', async (req, res) => {
  try {
    const pub = new DataOwner();
    await pub.init({
      masterSecret: req.body.masterSecret,
      seed: req.body.seed,
    });
    ownerStore.set(req.body.id, pub);
    return res.json(itemToJson(pub, req.body.id));
  } catch (error) {
    console.log(error);
    return error;
  }
});
app.get('/owner/get', (req, res) => {
  try {
    const pub = ownerStore.get(req.query.id);
    return res.json(itemToJson(pub, req.query.id));
  } catch (error) {
    console.log(error);
  }
});

app.get('/owner/all', (req, res) => {
  try {
    res.json(Array.from(ownerStore).map(e => itemToJson(e[1], e[0])));
  } catch (error) {
    console.log(error);
  }
});
app.post('/owner/checkRequestAddress', async (req, res) => {
  try {
    const pub = ownerStore.get(req.body.id);
    await pub.getAccessRequests();

    return res.json(itemToJson(pub, req.body.id));
  } catch (error) {
    console.log(error);
  }
});
app.post('/owner/getNextMessage', async (req, res) => {
  try {
    const pub = ownerStore.get(req.body.id);
    const msg = await pub.getMessage(req.body.pubId);
    return res.json(itemToJson(pub, req.body.id));
  } catch (error) {
    console.log(error);
    return res.status(500).send(error.toString());
  }
});
app.post('/owner/fetchMessages', async (req, res) => {
  try {
    const pub = ownerStore.get(req.body.id);
    const msg = await pub.fetchMessages(req.body.pubId);
    return res.json(itemToJson(pub, req.body.id));
  } catch (error) {
    console.log(error);
    return res.status(500).send(error.toString());
  }
});
app.post('/owner/acceptRequest', async (req, res) => {
  try {
    const pub = ownerStore.get(req.body.id);
    await pub.acceptAccessRequest(req.body.requestId);

    return res.json(itemToJson(pub, req.body.id));
  } catch (error) {
    console.log(error);
  }
});

// ---------------------------------------------------------
app.post('/reciever/add', async (req, res) => {
  try {
    const pub = new DataReciever({
      seed: req.body.seed,
    });
    await pub.init();
    recieverStore.set(req.body.id, pub);
    return res.json(pub);
  } catch (error) {
    console.log(error);
    return error;
  }
});

app.get('/reciever/get', async (req, res) => {
  try {
    const pub = recieverStore.get(req.query.id);
    return res.json(itemToJson(pub, req.query.id));
  } catch (error) {
    console.log(error);
    return error;
  }
});
app.get('/reciever/all', async (req, res) => {
  try {
    res.json(Array.from(recieverStore).map(e => itemToJson(e[1], e[0])));
  } catch (error) {
    console.log(error);
    return error;
  }
});
app.post('/reciever/requestAccess', async (req, res) => {
  try {
    const pub = recieverStore.get(req.body.recieverId);
    const peer = ownerStore.get(req.body.peer);
    const resp = await pub.requestAccess({
      dataType: 1,
      start: DateTag.fromString(req.body.start),
      end: DateTag.fromString(req.body.end),
      peerAddress: peer.getSubscriptionRequestAddress(),
      peerPubKey: peer.getPubKey(),
      publisherId: req.body.publisherId,
    });
    return res.json(itemToJson(pub, req.body.recieverId));
  } catch (error) {
    console.log(error);
    return error;
  }
});
app.post('/reciever/checkOpenRequests', async (req, res) => {
  try {
    const pub = recieverStore.get(req.body.id);
    await pub.checkOpenRequests();
    return res.json(itemToJson(pub, req.body.id));
  } catch (error) {
    console.log(error);
    return error;
  }
});
app.post('/reciever/fetchMessages', async (req, res) => {
  try {
    const pub = recieverStore.get(req.body.id);
    await pub.fetchMessages(req.body.connId);
    return res.json(itemToJson(pub, req.body.id));
  } catch (error) {
    console.log(error);
    return error;
  }
});

// ---------------------------------------------------------

app.post('/performance/hashnodesFromDaterange', (req, res) => {
  try {
    const rounds = req.body.rounds;
    const performance = [];
    for (let index = 0; index < rounds; index++) {
      const yearstart = 2019 + Math.floor(Math.random() * (2 - 0) + 0);
      const yearend = yearstart + Math.floor(Math.random() * (2 - 0) + 0);
      const monthstart = Math.floor(Math.random() * (12 - 1) + 1);
      let monthend = Math.floor(Math.random() * (12 - 1) + 1);
      if (yearstart === yearend) {
        while (monthstart > monthend) {
          monthend = Math.floor(Math.random() * (12 - 1) + 1);
        }
      }
      const daystart = Math.floor(Math.random() * (31 - 1) + 1);
      let dayend = Math.floor(Math.random() * (31 - 1) + 1);

      if (yearstart === yearend && monthstart === monthend) {
        while (daystart > dayend) {
          dayend = Math.floor(Math.random() * (31 - 1) + 1);
        }
      }
      const dateStart = new DateTag(yearstart, monthstart, daystart);
      const dateEnd = new DateTag(yearend, monthend, dayend);
      const mastersecret = 'SomeSecret';
      let hrTime = process.hrtime();
      const startTime = hrTime[0] * 1000000 + hrTime[1] / 1000;

      const hashlist = hashListFromDatatags(mastersecret, dateStart, dateEnd);
      hrTime = process.hrtime();
      const endTime = hrTime[0] * 1000000 + hrTime[1] / 1000;
      const duration = Math.floor(endTime - startTime);
      const perf = {
        startDate: dateStart.toString(),
        endDate: dateEnd.toString(),
        hashlistLenght: hashlist.length,
        duration,
      };
      performance.push(perf);
    }
    return res.json(performance);
  } catch (error) {
    console.log(error);
  }
});
app.post('/performance/hashFromDatetag', (req, res) => {
  try {
    const rounds = req.body.rounds;
    const mastersecret = req.body.mastersecret;
    const format = ['YMD', 'YMDH', 'YMDHM'];
    const performance = [];
    for (let index = 0; index < format.length; index++) {
      const currentFormat = format[index];

      for (let index = 0; index < rounds; index++) {
        const year = Math.floor(Math.random() * (2050 - 2015) + 1);
        const month = Math.floor(Math.random() * (12 - 1) + 1);
        const day = Math.floor(Math.random() * (31 - 1) + 1);
        let hour;
        let minute;
        let second;
        if (currentFormat === 'YMDH') {
          hour = Math.floor(Math.random() * (24 - 0) + 0);
        }
        if (currentFormat === 'YMDHM') {
          hour = Math.floor(Math.random() * (24 - 0) + 0);
          minute = Math.floor(Math.random() * (60 - 0) + 0);
        }
        if (currentFormat === 'YMDHMS') {
          hour = Math.floor(Math.random() * (24 - 0) + 0);
          minute = Math.floor(Math.random() * (60 - 0) + 0);
          second = Math.floor(Math.random() * (60 - 0) + 0);
        }
        const date = new DateTag(year, month, day, hour, minute, second);

        let hrTime = process.hrtime();
        const startTime = hrTime[0] * 1000000 + hrTime[1] / 1000;
        const hash = hashFromDatetag(mastersecret, date);
        hrTime = process.hrtime();

        const endTime = hrTime[0] * 1000000 + hrTime[1] / 1000;
        const duration = Math.floor(endTime - startTime);
        const perf = {
          date: date.toString(),
          hash,
          mastersecret,
          duration,
          format: currentFormat,
        };
        performance.push(perf);
      }
    }
    return res.json(performance);
  } catch (error) {
    console.log(error);
  }
});
app.post('/performance/publishPubkey', async (req, res) => {
  try {
    const rounds = req.body.rounds;
    const performance = [];
    for (let index = 0; index < rounds; index++) {
      const rec = new DataReciever({
        seed: generateSeed(),
      });
      await rec.init();
      const perfarray = Array.from(rec.performanceMap);
      performance.push(...perfarray);
      await timeout(4000);
    }
    return res.json(performance);
  } catch (error) {
    console.log(error);
  }
});

app.post('/performance/sentMessage', async (req, res) => {
  try {
    const publisher = publisherStore.get(req.body.publisherId);
    const txs = await publisher.sentMessage(req.body.payload);
    res.json(txs);
  } catch (error) {
    console.log(error);
  }
});

// ---------------------------------------------------------

app.listen(process.env.PORT || 9999, () =>
  console.log(`Example app listening on port ${process.env.PORT || 9999}!`)
);
// start our server
// server.listen(process.env.PORT || 8999, () => {
//   // @ts-ignore
//   console.log(`Server started on port ${server.address().port} :)`);
// });
function replacer(key, value) {
  if (key == 'runInterval') {
    return true;
  } else if (key == 'accessRequests') {
    return Array.from(value);
  } else if (key == 'dataConnectors') {
    return Array.from(value);
  } else if (key == 'decryptedMessages') {
    return Array.from(value);
  } else if (key == 'dateMap') {
    return Array.from(value);
  } else if (key == 'performanceMap') {
    return Array.from(value);
  } else {
    return value;
  }
}

function itemToJson(item: any, id: string) {
  return {
    id,
    data: JSON.parse(JSON.stringify(item, replacer)),
  };
}
async function sentNumberOFMessages(
  publisher: DataPublisher,
  numberOfMessages: number
) {
  for (let index = 0; index < numberOfMessages; index++) {
    const pause = timeout(defaultPublishIntervall);
    await publisher.sentMessage(new Date().toISOString());
    await pause;
  }
}

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
