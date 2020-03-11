import { createKeyPair, KeyPair } from '@decentralized-auth/ntru';
import * as ntru from '@decentralized-auth/ntru';
import { asciiToTrytes, trits, trytes } from '@iota/converter';
import { API, Bundle, composeAPI, Transaction } from '@iota/core';
import { Trytes } from '@iota/core/typings/types';
import * as iotaJson from '@iota/extract-json';
import { AES } from 'crypto-js';
import { type } from 'os';
import { IHashItem } from '../typings/HashStore';
import { IRequestMsg, IWelcomeMsg } from '../typings/messages/WelcomeMsg';
import { defaultNodeAddress } from './config';
import DataPublishConnector from './DataPublishConnector';
import DateTag from './DateTag';
import { hashCurl, hashFromBinStr } from './hashingTree';
import { groupBy } from './helpers';
import {
  generateSeed,
  getPubKeyFromTangle,
  IParsedRequestMessage,
  parseRequestMessage,
  sentMsgToTangle,
} from './iotaUtils';
import SubscriptionStore, { ISubscription } from './SubscriptionStore';
import { getNodesBetween } from './treeCalculation';
export default class SubscriptionManager {
  public iota: API;
  public subscriptionRequestAddress: string;
  public accessRequests: Map<string, IRequestMsg>;
  private keyPair: KeyPair;
  private seed: string;
  private masterSecret: string;
  private subscriptionStore: Map<string, ISubscription>;
  constructor({
    masterSecret,
    keyPair,
    seed,
    subscriptionRequestAddress,
  }: {
    masterSecret: string;
    keyPair?: KeyPair;
    seed?: string;
    subscriptionRequestAddress?: string;
  }) {
    this.subscriptionStore = new Map();
    this.accessRequests = new Map();
    this.masterSecret = masterSecret;
    if (keyPair) {
      this.keyPair = keyPair;
    }
    if (!seed) {
      this.seed = generateSeed();
    } else {
      this.seed = seed;
    }
    this.subscriptionRequestAddress = subscriptionRequestAddress
      ? subscriptionRequestAddress
      : trytes(hashCurl(trits(this.seed), trits('REQUESTADDRESS')));
  }
  /**
   * init
   */
  public async init() {
    if (this.keyPair !== undefined) {
      throw Error('Keypair already set');
    }
    this.keyPair = await createKeyPair(this.seed);
    this.iota = composeAPI({
      provider: defaultNodeAddress,
    });
    console.log('Subscription manager initialized.')
  }

  /**
   * connectToTangle
   */
  public connectToTangle() {
    this.iota = composeAPI({
      provider: defaultNodeAddress,
    });
  }
  /**
   * getPubKey
   */
  public getPubKey(asTrytes = true): string | Uint8Array | undefined {
    try {
      return asTrytes
        ? ntru.toTrytes(this.keyPair.public)
        : this.keyPair.public;
    } catch {
      return undefined;
    }
  }
  /**
   * fetchSubscriptionRequests
   */
  public async fetchSubscriptionRequests(): Promise<IParsedRequestMessage[]> {
    const transactions: Transaction[] = await this.iota.findTransactionObjects({
      addresses: [this.subscriptionRequestAddress],
    });
    // make sure only zero value transactions are pproccessed
    const zeroValTrans = transactions.filter(t => t.value === 0);
    const groupedBundles: TTransactionMap = groupBy(
      zeroValTrans,
      t => t.bundle
    );

    const messages = await this.decryptRequestBundel(groupedBundles);
    return messages;
  }
  /**
   * getSubscriptionRequestAddress
   */
  public getSubscriptionRequestAddress(): string {
    return this.subscriptionRequestAddress;
  }
  /**
   * decryptRequestBundels
   */
  public async decryptRequestBundel(
    bundle: TTransactionMap
  ): Promise<IParsedRequestMessage[]> {
    let promises: Array<Promise<IParsedRequestMessage>> = [];
    bundle.forEach((v, k) => {
      const prom = parseRequestMessage(v, this.keyPair.private);
      promises = [...promises, prom];
    });
    const results = await Promise.all(promises);

    results.forEach(v => this.accessRequests.set(v.bundle, v.msg));
    return results;
  }
  /**
   * sentRequestAcceptMsg
   */
  public async sentRequestAcceptMsg(sub: ISubscription) {
    const hashList = this.getNodeHashesForDaterange(sub.startDate, sub.endDate);
    const payload = {
      hashList,
      startRoot: sub.startRoot,
      startDate: sub.startDate,
      endDate: sub.endDate,
    };
    console.log(payload);
    const hashListJson = JSON.stringify(payload);

    // encrypt the symetric key of the data with the pubKey
    const secret = this.masterSecret;
    const address = sub.responseAddress;
    const hashListEnc = AES.encrypt(hashListJson, secret).toString();
    const hashListTrytes = asciiToTrytes(hashListEnc);
    const recieverPubKey = await getPubKeyFromTangle({
      address: sub.pubKey,
      iota: this.iota,
    });
    const secretEnc: Trytes = ntru.encrypt(secret, recieverPubKey);
    const msgTrytes = secretEnc + hashListTrytes;
    const tag = `${secretEnc.length.toString()}-${hashListTrytes.length.toString()}`;
    const msg = await sentMsgToTangle(
      this.iota,
      this.seed,
      address,
      msgTrytes,
      asciiToTrytes(tag)
    );
    return msg;
  }
  /**
   * acceptRequest
   */
  public async acceptRequest(
    requestBundleHash: string,
    dataConnectors: Map<string, DataPublishConnector>
  ) {

    const reqBundle = this.accessRequests.get(requestBundleHash);

    const {
      dataType,
      nextAddress,
      endDate,
      pubKeyAddress,
      startDate,
      publisherId,
    } = reqBundle;

    const connector = dataConnectors.get(publisherId);
    if (!connector) {
      throw Error(`No Data Connector with id ${publisherId}`);
    }
    const msgs = await connector.fetchAllMessages();
    console.log(`Fetched ${msgs.length} messages.`);
    const tagString = startDate.toString().substring(0, 8);
    const nextRoot = connector.dateMap.get(tagString);
    if (!nextRoot) {
      throw Error('No Message in stream with given Tag');
    }

    const sub: ISubscription = {
      dataType,
      endDate,
      pubKey: pubKeyAddress,
      responseAddress: nextAddress,
      startDate,
      startRoot: nextRoot,
    };
    const acceptTrans = await this.sentRequestAcceptMsg(sub);

    this.subscriptionStore.set(requestBundleHash, sub);
    return sub;
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
}

type TTransactionMap = Map<string, Transaction[]>;
