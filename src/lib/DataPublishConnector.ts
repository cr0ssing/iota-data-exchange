import { API, composeAPI } from '@iota/core';
import { Transaction } from '@iota/core/typings/types';
import { MAM_MODE, MamReader } from 'mam.ts';
import { type } from 'os';
import { defaultNodeAddress } from './config';
import { HashList } from './HashStore';
import { tagTrytesToDateTag } from './helpers';
import MamReaderExtended from './MamReaderExtendet';

export default class {
  private dataReader: MamReaderExtended;
  private iota: API;
  private masterSecret: string;
  private streamMessages: Map<string, Transaction[]>;
  private decryptedMessages: Map<string, string | object>;
  constructor({
    masterSecret,
    streamMessages,
    iota,
  }: {
    masterSecret: string;
    streamMessages?: TStreamMessages;
    iota?: API;
  }) {
    this.masterSecret = masterSecret;
    this.streamMessages = streamMessages ? streamMessages : new Map();
    this.iota = iota ? iota : composeAPI({ provider: defaultNodeAddress });
    this.decryptedMessages = new Map();
  }
  /**
   * connect
   */
  public async connect(nextRoot: string, hashList: HashList) {
    // const t: Transaction[] = await this.iota.findTransactions({
    //   addresses: [nextRoot],
    // });
    // const tagTrytes = t[0].tag;
    // const tagPlain = tagTrytesToDateTag(tagTrytes);

    this.dataReader = new MamReaderExtended({
      provider: defaultNodeAddress,
      root: nextRoot,
      mode: MAM_MODE.RESTRICTED,
      sideKey: 'unsecure',
      hashList,
    });
  }
  /**
   * getNextRoot
   */
  public getNextRoot() {
    return this.dataReader.getNextRoot();
  }
  /**
   * getMsg
   */
  public async getMsg() {
    const message = await this.dataReader.getMessage();
    this.decryptedMessages.set(message.root, message.msg);
    return message;
  }
  /**
   * fetchAllMessages
   */
  public async fetchAllMessages() {
    let fetchedAll = false;
    let messages = [];
    while (!fetchedAll) {
      try {
        const message = await this.dataReader.getMessage();
        this.decryptedMessages.set(message.root, message.msg);
        messages = [...messages, message];
      } catch (error) {
        fetchedAll = true;
      }
    }
    return messages;
  }
}
type TStreamMessages = Map<string, Transaction[]>;
