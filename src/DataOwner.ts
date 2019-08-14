import SubscriptionManager from './SubscriptionManager';

export default class DataOwner {
  private subMan: SubscriptionManager;
  private seed: string;
  /**
   * init
   */
  public async init({
    masterSecret,
    seed,
    subscriptionRequestAddress,
  }: IInitDataOwner) {
    this.seed = seed;
    this.subMan = new SubscriptionManager({
      masterSecret,
      seed,
      subscriptionRequestAddress,
    });
    const subManinit = await this.subMan.init();
  }
  /**
   * getSubscriptionRequestAddress
   */
  public getSubscriptionRequestAddress(): string {
    return this.subMan.getSubscriptionRequestAddress();
  }
  /**
   * getPubKey
   */
  public getPubKey() {
    return this.subMan.getPubKey().toString();
  }
  /**
   * getAccessRequests
   */
  public async getAccessRequests() {
    return this.subMan.fetchSubscriptionRequests();
  }
  /**
   * decryptRequests
   */
  public async decryptRequests() {
    return await this.subMan.decryptRequestBundel();
  }
}

interface IInitDataOwner {
  seed: string;
  masterSecret: string;
  subscriptionRequestAddress: string;
}
