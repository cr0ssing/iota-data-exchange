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
import DateTag from './DateTag';

import * as ntru from '@decentralized-auth/ntru';
import { createKeyPair, KeyPair } from '@decentralized-auth/ntru';
import { Trytes } from '@iota/core/typings/types';
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
  public subscriptionRequestAddress;
  private keyPair: KeyPair;
  private seed: string;
  private masterSecret: string;
  private subscriptionsStore: SubscriptionStore;
  private rejectedRequests: Map<string, Transaction>;
  private requestStore: string[];
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
      : 'AAAAAWORLDHELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDDDKYVEVAEX';
    this.subscriptionsStore = new SubscriptionStore([]);
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
      provider: 'https://nodes.iota.cafe:443',
    });
  }

  /**
   * connectToTangle
   */
  public connectToTangle() {
    this.iota = composeAPI({
      provider: 'https://nodes.iota.cafe:443',
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
   * sentRequestAcceptMsg
   */
  public async sentRequestAcceptMsg(sub: ISubscription) {
    const hashList = this.getNodeHashesForDaterange(sub.startDate, sub.endDate);
    const hashListJson = JSON.stringify(hashList);

    // encrypt the symetric key of the data with the pubKey
    // FIXME make secret changeable
    const secret = 'SomeSecret';
    const address = sub.pubKey;
    const hashListEnc = AES.encrypt(hashListJson, secret).toString();
    const hashListTrytes = asciiToTrytes(hashListEnc);

    // FIXME change to pubKey of subscription
    const secretEnc: Trytes = ntru.encrypt(secret, this.getPubKey());
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
