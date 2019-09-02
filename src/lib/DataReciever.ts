import { createKeyPair, KeyPair, toTrytes } from '@decentralized-auth/ntru';

import { tritsToTrytes, trytesToTrits } from '@iota/converter';
import { Address, API, Bundle, composeAPI, Transaction } from '@iota/core/';
import { generateKeyPair } from 'crypto';
import {
  EDataTypes,
  IRequestMsg,
  IWelcomeMsg,
} from '../typings/messages/WelcomeMsg';
import { defaultNodeAddress } from './config';
import DataPublishConnector from './DataPublishConnector';
import DateTag from './DateTag';
import { hash, hashCurl } from './hashingTree';
import HashStore from './HashStore';
import { groupBy } from './helpers';
import {
  encryptMsg,
  generateSeed,
  IParsedWelcomeMessage,
  parseRequestMessage,
  parseWelcomeMessage,
  sentMsgToTangle,
} from './iotaUtils';
import MamReaderExtended from './MamReaderExtendet';

export class DataReciever {
  public requests: IRequestsState = {
    active: [],
    closed: [],
    open: [],
  };
  private seed: string;
  private keyPair: KeyPair;
  private pubKeyAddress: string;
  private iota: API;
  private hashStore: HashStore;
  private dataConnectors: Map<string, DataPublishConnector>;

  constructor({ seed }: { seed: string }) {
    this.iota = composeAPI({
      provider: defaultNodeAddress,
    });
    this.seed = seed ? seed : generateSeed();
    this.dataConnectors = new Map();
    this.hashStore = new HashStore([]);
  }
  /**
   * init
   */
  public async init() {
    this.keyPair = await createKeyPair(this.seed);
    this.pubKeyAddress = await this.publishPubKey();
  }
  /**
   * publishPubKey
   */
  public async publishPubKey(): Promise<string> {
    const pubKeyTryte = toTrytes(this.keyPair.public);
    const pubKeyAdd = tritsToTrytes(hashCurl(trytesToTrits(pubKeyTryte)));
    const tanglePubKey: Transaction[] = await this.iota.findTransactionObjects({
      addresses: [pubKeyAdd],
    });
    if (tanglePubKey.length > 0) {
      return tanglePubKey[0].bundle;
    } else {
      const msg = await sentMsgToTangle(
        this.iota,
        this.seed,
        pubKeyAdd,
        pubKeyTryte,
        'PUBKEY'
      );
      return msg[0].bundle;
    }
  }
  /**
   * getPubKeyAddress
   */
  public getPubKeyAddress() {
    if (this.pubKeyAddress) {
      return this.pubKeyAddress;
    } else {
      throw new Error('no public key address found');
    }
  }
  /**
   * requestAccess
   */
  public async requestAccess({
    start,
    end,
    peerAddress,
    peerPubKey,
    dataType,
    publisherId,
  }: {
    start: DateTag;
    end: DateTag;
    peerAddress: string;
    peerPubKey: string;
    dataType: EDataTypes;
    publisherId: string;
  }) {
    const welcomeMsg: IRequestMsg = {
      dataType,
      endDate: end,
      nextAddress: generateSeed(),
      pubKeyAddress: this.getPubKeyAddress(),
      startDate: start,
      publisherId,
    };
    const pPubKey =
      peerPubKey.length === 81
        ? await this.iota.getTrytes([peerPubKey])
        : peerPubKey;
    const encryptedMsg = encryptMsg(JSON.stringify(welcomeMsg), pPubKey);
    const trans = await sentMsgToTangle(
      this.iota,
      this.seed,
      peerAddress,
      encryptedMsg.msgTrytes,
      encryptedMsg.meta
    );
    const request: IDataRecieverRequest = {
      msg: welcomeMsg,
      peerAddress,
      secret: encryptedMsg.encSecret,
      state: ERequestState.open,
      tangleAddress: trans[0].bundle,
    };
    this.addRequest(request);
    return request;
  }
  /**
   * checkOpenRequests
   */
  public async checkOpenRequests() {
    const openRequestAddresses = this.requests.open.map(e => e.msg.nextAddress);
    if (openRequestAddresses.length === 0) {
      throw Error('no open Requests found');
    }
    openRequestAddresses.forEach(async address => {
      try {
        const requestResponses = await this.iota.findTransactionObjects({
          addresses: [address],
        });
        const res = await parseWelcomeMessage(
          requestResponses,
          this.keyPair.private
        );
        this.requests.open = this.requests.open.filter(
          e => e.msg.nextAddress !== address
        );
        this.requests.active = [...this.requests.active, res];
        this.saveWelcomeMessage(res);
      } catch (error) {
        console.log(error);
      }
    });
    // const bundles = groupBy(requestResponses, e => e.bundle);
    return;
  }
  /**
   * saveWelcomeMessages
   */
  public async saveWelcomeMessage(msg: IParsedWelcomeMessage) {
    this.hashStore.addToHashList(msg.msg);
    const connector = new DataPublishConnector({});
    try {
      await connector.connect(msg.startRoot, msg.msg);
    } catch (error) {
      throw error;
    }
    this.dataConnectors.set(msg.bundle, connector);
  }
  public async fetchMessages(connId: string) {
    const conn = this.dataConnectors.get(connId);
    await conn.fetchAllMessages();
    return;
  }
  private addRequest(request: IDataRecieverRequest) {
    if (this.requests.open) {
      this.requests.open = [...this.requests.open, request];
    } else {
      this.requests.open = [request];
    }
  }
}

interface IRequestsState {
  open: IDataRecieverRequest[];
  active: IParsedWelcomeMessage[];
  closed: IDataRecieverRequest[];
}

interface IDataRecieverRequest {
  state: ERequestState;
  msg: any;
  peerAddress: string;
  secret: string;
  tangleAddress: string;
}

enum ERequestState {
  open,
  active,
  closed,
}
