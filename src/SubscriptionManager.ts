import { ntru } from 'ntru';
import SubscriptionStore from './SubscriptionStore';
export default class SubscriptionManager {
  private keyPair: IKeyPair;
  private masterSecret: string;
  private subscriptionsStore: SubscriptionStore;
  constructor(masterSecret: string, keyPair?: IKeyPair) {
    this.masterSecret = masterSecret;
    if (keyPair) {
      this.keyPair = keyPair;
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
   * getPubKey
   */
  public getPubKey() {
    return this.keyPair;
  }
}

export interface IKeyPair {
  privateKey: Uint8Array;
  publicKey: Uint8Array;
}
