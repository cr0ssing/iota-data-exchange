import { createKeyPair, KeyPair } from '@decentralized-auth/ntru';
import * as ntru from '@decentralized-auth/ntru';
import { asciiToTrytes } from '@iota/converter';
import { API, Bundle, composeAPI, Transaction } from '@iota/core';
import { Trytes } from '@iota/core/typings/types';
import * as iotaJson from '@iota/extract-json';
import { AES } from 'crypto-js';
import { defaultNodeAddress } from './config';
import DateTag from './DateTag';
import { hashFromBinStr } from './hashingTree';
import { groupBy } from './helpers';
import {
  generateSeed,
  parseWelcomeMessage,
  sentMsgToTangle,
} from './iotaUtils';
import SubscriptionStore, { ISubscription } from './SubscriptionStore';
import { getNodesBetween } from './treeCalculation';
import { IHashItem } from './typings/HashStore';
import { IRequestMsg } from './typings/messages/WelcomeMsg';
export default class SubscriptionManager {
  public iota: API;
  public subscriptionRequestAddress: string;
  private keyPair: KeyPair;
  private seed: string;
  private masterSecret: string;
  private requests: Map<string, Transaction[]>;
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
  public async fetchSubscriptionRequests(): Promise<
    Map<string, Transaction[]>
  > {
    const transactions: Transaction[] = await this.iota.findTransactionObjects({
      addresses: [this.subscriptionRequestAddress],
    });
    // make sure only zero value transactions are pproccessed
    const zeroValTrans = transactions.filter(t => t.value === 0);
    const groupedBundles: Map<string, Transaction[]> = groupBy(
      zeroValTrans,
      t => t.bundle
    );
    this.requests = groupedBundles;
    return groupedBundles;
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
  public async decryptRequestBundel(): Promise<string[]> {
    let res = [];
    for (const v of this.requests.values()) {
      const msg = await parseWelcomeMessage(v, this.keyPair.private);
      res = [...res, msg];
    }
    return res;
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
}
