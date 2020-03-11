import DataPublishConnector from './DataPublishConnector';
import SubscriptionManager from './SubscriptionManager';

export class DataOwner {
  private subMan: SubscriptionManager;
  private seed: string;
  private dataConnectors: Map<string, DataPublishConnector>;
  /**
   * init
   */
  public async init({
    masterSecret,
    seed,
    subscriptionRequestAddress,
  }: IInitDataOwner) {
    this.dataConnectors = new Map();
    this.seed = seed;
    this.subMan = new SubscriptionManager({
      masterSecret,
      seed,
      subscriptionRequestAddress,
    });
    const subManinit = await this.subMan.init();
    console.log('Owner initialized.');
  }
  /**
   * getMessage
   */
  public async getMessage(connId: string) {
    const conn = this.dataConnectors.get(connId);
    console.log(conn);
    return await conn.getMsg();
  }
  /**
   * fetchMessages
   */
  public async fetchMessages(connId: string) {
    const conn = this.dataConnectors.get(connId);
    return await conn.fetchAllMessages();
  }
  /**
   * addDataConnector
   */
  public addDataConnector({
    conn,
    id,
  }: {
    conn: DataPublishConnector;
    id: string;
  }) {
    this.dataConnectors.set(id, conn);
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
    const res = await this.subMan.fetchSubscriptionRequests();
    return res;
  }
  /**
   * acceptAccessRequest
   */
  public async acceptAccessRequest(request: string) {
    return this.subMan.acceptRequest(request, this.dataConnectors);
  }
}

interface IInitDataOwner {
  seed: string;
  masterSecret: string;
  subscriptionRequestAddress?: string;
}
