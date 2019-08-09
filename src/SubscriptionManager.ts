import {
  asciiToTrytes,
  bytesToTrits,
  tritsToBytes,
  tritsToTrytes,
  trytesToAscii,
  trytesToTrits,
} from '@iota/converter';
import { API, Bundle, composeAPI, errors, Transaction } from '@iota/core';
import * as iotaJson from '@iota/extract-json';
import { AES, SHA3 } from 'crypto-js';
import { ntru } from 'ntru';
import DateTag from './DateTag';

import { hashFromBinStr } from './hashingTree';
import { groupBy, uniqueBundelHashes } from './helpers';
import { generateSeed, sentMsgToTangle } from './iotaUtils';
import SubscriptionStore, { ISubscription } from './SubscriptionStore';
import { asciiToTrits } from './ternaryStringOperations';
import { getNodesBetween } from './treeCalculation';
import { IHashItem } from './typings/HashStore';
import { IRequestMsg } from './typings/messages/WelcomeMsg';
export default class SubscriptionManager {
  public iota: API;
  public subscriptionRequestAddress =
    'AAAAAWORLDHELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDDDKYVEVAEX';
  private keyPair: IKeyPair;
  private seed: string;
  private masterSecret: string;
  private subscriptionsStore: SubscriptionStore;
  private rejectedRequests: Map<string, Transaction>;
  private requestStore: string[];
  constructor(masterSecret: string, keyPair?: IKeyPair, seed?: string) {
    this.masterSecret = masterSecret;
    if (keyPair) {
      this.keyPair = keyPair;
    }
    if (!seed) {
      this.seed = generateSeed();
    }
    this.subscriptionsStore = new SubscriptionStore([]);
  }
  /**
   * init
   */
  public async init() {
    if (this.keyPair !== undefined) {
      throw Error('Keypair already set');
    }
    this.keyPair = await ntru.keyPair();
  }

  /**
   * connectToTangle
   */
  public connectToTangle() {
    this.iota = composeAPI({
      provider: 'https://nodes.thetangle.org:443',
    });
  }
  /**
   * getPubKey
   */
  public getPubKey() {
    try {
      return this.keyPair.publicKey;
    } catch {
      return undefined;
    }
  }
  /**
   * fetchSubscriptionRequests
   */
  public async fetchSubscriptionRequests() {
    const transactions: Transaction[] = await this.iota.findTransactionObjects({
      addresses: [this.subscriptionRequestAddress],
    });
    // make sure only zero value transactions are pproccessed
    const zeroValTrans = transactions.filter(t => t.value === 0);
    const groupedBundles: Map<string, Transaction[]> = groupBy(
      zeroValTrans,
      t => t.bundle
    );

    return groupedBundles;
  }
  /**
   * decryptRequestBundels
   */
  public decryptRequestBundel(bundle: Bundle): IRequestMsg | {} {
    const trans = bundle
      .map(e => e)
      .sort((a, b) => a.currentIndex - b.currentIndex);
    try {
      const json = iotaJson.extractJson(trans);
      const jsonObj = JSON.parse(json);
      // TODO Add typecheck if it fits the message Type
      return jsonObj;
    } catch (error) {
      return {};
    }
  }
  /**
   * name
   */
  public evaluateRequestMessages(bundles: string[]) {}
  /**
   * sentRequestAcceptMsg
   */
  public async sentRequestAcceptMsg(sub: ISubscription) {
    const hashList = this.getNodeHashesForDaterange(sub.startDate, sub.endDate);
    // encrypt the symetric key of the data with the pubKey
    // TODO make secret changeable
    const secret = 'SomeSecret';
    const secretTrits = asciiToTrits('SomeSecret');
    const secretBytes = tritsToBytes(secretTrits);
    const secretUint = Uint8Array.from(secretBytes);
    const encTag = await ntru.encrypt(secretUint, this.keyPair.publicKey);
    const encdecTag = await ntru.decrypt(encTag, this.keyPair.privateKey);
    const decBuffer = Buffer.from(encdecTag);
    const decTrits = bytesToTrits(decBuffer);
    const compSecDec = secretTrits.toString() === decTrits.toString();
    const decStr = trytesToAscii(tritsToTrytes(decTrits));
    const comp = encdecTag.toString() === secretUint.toString();
    // const encdecTagTryte = tritsToTrytes(encdecTagString);
    const hashListEnc = AES.encrypt(
      JSON.stringify(hashList),
      encTag.toString()
    );
    const tagBuffer = Buffer.from(encTag.buffer);
    const address = sub.pubKey;
    const msg = await sentMsgToTangle(
      this.iota,
      this.seed,
      address,
      hashListEnc.toString(),
      tritsToTrytes(bytesToTrits(tagBuffer))
    );
    return msg;
  }
  /**
   * decrypt
   */
  public async decrypt(msg: string) {
    const msgBuffer = tritsToBytes(trytesToTrits(msg));
    const decMsg = await ntru.decrypt(msgBuffer, this.keyPair.privateKey);
    return decMsg;
  }
  private getNodeHashesForDaterange(s: DateTag, e: DateTag) {
    const dateRangePaths = getNodesBetween(s, e);
    const hashList: IHashItem[] = dateRangePaths.map(p => {
      return {
        hash: hashFromBinStr(this.masterSecret, p),
        prefix: p,
      };
    });
    return hashList;
  }
  /**
   * Update the transactions on the RequestAddress
   * @param transList
   */
  private updateRequestTransactions(transList: string[]) {
    this.requestStore = transList;
  }
}

export interface IKeyPair {
  privateKey: Uint8Array;
  publicKey: Uint8Array;
}
