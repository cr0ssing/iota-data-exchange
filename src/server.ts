// import express = require("express");

import { createKeyPair, toTrytes } from '@decentralized-auth/ntru';
import * as express from 'express';

import * as cors from 'cors';
import * as http from 'http';
import * as WebSocket from 'ws';
import { DataOwner, DataPublisher, DataReciever } from './lib';
import DateTag from './lib/DateTag';
const app = express();
const router = express.Router();
const publisherStore: Map<string, DataPublisher> = new Map();
const ownerStore: Map<string, DataOwner> = new Map();
const recieverStore: Map<string, DataReciever> = new Map();

app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(cors());
app.post('/proprofe', function(req, res, next) {
  console.log(req.body);
  res.json(req.body);
});

app.get('/', (req, res) => {
  return res.send('HelloWorld');
});

app.post('/getKeyPair', (req, res) => {
  const string = toTrytes(createKeyPair(req.body.seed).public);
  console.log(req.body);
  return res.send(string);
});

app.get('/publisher/all', (req, res) => {
  res.json(Array.from(publisherStore));
});
app.post('/addDataPublisher', async (req, res) => {
  const pub = new DataPublisher();
  await pub.init({
    masterSecret: req.body.masterSecret,
    seed: req.body.seed,
  });
  publisherStore.set(req.body.id, pub);
  return res.json(pub);
});
app.get('/getDataPublisher', (req, res) => {
  const pub = publisherStore.get(req.query.id);
  return res.json(pub);
});
app.get('/getDataPublisherMessages', (req, res) => {
  const pub = publisherStore.get(req.query.id);
  return res.json(pub.getMessageAddresses());
});

app.post('/runDataPublisher', async (req, res) => {
  const pub = publisherStore.get(req.body.id);
  try {
    const inte = await pub.run(5000);
    return res.json(inte);
  } catch (error) {
    return res.json(error);
  }
});
app.post('/stopDataPublisher', async (req, res) => {
  const pub = publisherStore.get(req.body.id);
  try {
    const inte = pub.stop();
    return res.json(inte);
  } catch (error) {
    return res.json(error);
  }
});

// ---------------------------------------------------------
app.post('/addDataOwner', async (req, res) => {
  try {
    const pub = new DataOwner();
    await pub.init({
      masterSecret: req.body.masterSecret,
      seed: req.body.seed,
    });
    ownerStore.set(req.body.id, pub);
    return res.json(pub);
  } catch (error) {
    console.log(error);
    return error;
  }
});
app.get('/getDataOwner', (req, res) => {
  const pub = ownerStore.get(req.query.id);
  return res.json(pub);
});
app.get('/dataOwner/getAccessRequests', (req, res) => {
  const pub = ownerStore.get(req.query.id);
  return res.json(pub.getAccessRequests());
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
    return res.json(pub);
  } catch (error) {
    console.log(error);
    return error;
  }
});
app.post('/reciever/requestAccess', async (req, res) => {
  try {
    const pub = recieverStore.get(req.query.id);
    const resp = await pub.requestAccess({
      dataType: 1,
      start: DateTag.fromString(req.body.start),
      end: DateTag.fromString(req.body.end),
      peerAddress: req.body.peerAddress,
      peerPubKey: req.body.peerPubKey,
    });
    return res.json(resp);
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