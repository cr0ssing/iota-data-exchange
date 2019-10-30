import { createKeyPair, KeyPair, toTrytes } from '@decentralized-auth/ntru';

import { tritsToTrytes, trytesToTrits } from '@iota/converter';
import { Address, API, Bundle, composeAPI, Transaction } from '@iota/core/';
import { generateKeyPair } from 'crypto';
import { CreateAttachToTangleWithPwrSvr } from '../mam/src/PwrSrv';
import {
  EDataTypes,
  IRequestMsg,
  IWelcomeMsg,
} from '../typings/messages/WelcomeMsg';
import {
  defaultDepth,
  defaultMwm,
  defaultNodeAddress,
  defaultPowApiKey,
} from './config';
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
  public performanceMap: Map<string, object>;
  private seed: string;
  private keyPair: KeyPair;
  private pubKeyAddress: string;
  private iota: API;
  private hashStore: HashStore;
  private dataConnectors: Map<string, DataPublishConnector>;

  constructor({
    seed,
    powApiKey = defaultPowApiKey,
  }: {
    seed: string;
    powApiKey?: string;
  }) {
    if (powApiKey && powApiKey !== '') {
      const timeout: number = 3000;
      const apiServer: string = 'https://api.powsrv.io:443';

      const attachFunction = CreateAttachToTangleWithPwrSvr(
        powApiKey,
        timeout,
        apiServer
      );
      this.iota = composeAPI({
        provider: defaultNodeAddress,
        attachToTangle: attachFunction,
      });
    } else {
      this.iota = composeAPI({
        provider: defaultNodeAddress,
      });
    }

    this.seed = seed ? seed : generateSeed();
    this.dataConnectors = new Map();
    this.hashStore = new HashStore([]);
    this.performanceMap = new Map();
  }
  /**
   * init
   */
  public async init() {
    let hrTime = process.hrtime();
    const startTime = hrTime[0] * 1000000 + hrTime[1] / 1000;

    this.keyPair = await createKeyPair(this.seed);
    hrTime = process.hrtime();
    const createKeyPairTime = hrTime[0] * 1000000 + hrTime[1] / 1000;

    this.pubKeyAddress = await this.publishPubKey();
    hrTime = process.hrtime();
    const publishPubKey = hrTime[0] * 1000000 + hrTime[1] / 1000;
    const performance = {
      overall: publishPubKey - startTime,
      publishPubKey: publishPubKey - createKeyPairTime,
      createKeyPair: createKeyPairTime - startTime,
      pubKeyAddress: this.pubKeyAddress,
      seed: this.seed,
      node: defaultNodeAddress,
      mwm: defaultMwm,
      depth: defaultDepth,
    };
    this.performanceMap.set(performance.pubKeyAddress, performance);
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
