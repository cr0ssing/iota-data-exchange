// import express = require("express");

import { createKeyPair, toTrytes } from '@decentralized-auth/ntru';
import * as cors from 'cors';
import * as express from 'express';
import * as http from 'http';
import * as mongoose from 'mongoose';
import { runInNewContext } from 'vm';
import * as WebSocket from 'ws';
import { DataOwner, DataPublisher, DataReciever } from './lib';
import DataPublishConnector from './lib/DataPublishConnector';
import DateTag from './lib/DateTag';
import { hashListFromDatatags } from './lib/hashingTree';
const app = express();
const router = express.Router();

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
    const inte = await pub.run(5000);
    return res.json(itemToJson(pub, req.body.id));
  } catch (error) {
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
// ---------------------------------------------------------

app.listen(process.env.PORT || 9999, () =>
  console.log(`Example app listening on port ${process.env.PORT}!`)
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
