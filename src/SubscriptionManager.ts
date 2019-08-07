import { API, composeAPI } from '@iota/core';
import { ntru } from 'ntru';
import { generateSeed } from './iotaUtils';
import SubscriptionStore from './SubscriptionStore';
export default class SubscriptionManager {
  public iota: API;
  public subscriptionRequestAddress =
    'AAAAAWORLDHELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDDDKYVEVAEX';
  private keyPair: IKeyPair;
  private seed: string;
  private masterSecret: string;
  private subscriptionsStore: SubscriptionStore;
  constructor(masterSecret: string, keyPair?: IKeyPair, seed?: string) {
    this.masterSecret = masterSecret;
    if (keyPair) {
      this.keyPair = keyPair;
    }
    if (seed) {
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
    const transactions = await this.iota.findTransactions({
      addresses: [this.subscriptionRequestAddress],
    });
    return transactions;
  }
}

export interface IKeyPair {
  privateKey: Uint8Array;
  publicKey: Uint8Array;
}
