import { API, composeAPI } from '@iota/core';
import { Transaction } from '@iota/core/typings/types';
import { MAM_MODE, MamReader } from 'mam.ts';
import { type } from 'os';
import { defaultNodeAddress } from './config';
import { tagTrytesToDateTag } from './helpers';

export default class {
  private dataReader: MamReader;
  private iota: API;
  private masterSecret: string;
  private streamMessages: Map<string, Transaction[]>;
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
  }
  /**
   * connect
   */
  public async connect(nextRoot: string) {
    // const t: Transaction[] = await this.iota.findTransactions({
    //   addresses: [nextRoot],
    // });
    // const tagTrytes = t[0].tag;
    // const tagPlain = tagTrytesToDateTag(tagTrytes);

    this.dataReader = new MamReader(
      defaultNodeAddress,
      nextRoot,
      MAM_MODE.RESTRICTED,
      'unsecure'
    );
  }
  /**
   * getMsg
   */
  public async getMsg() {
    return await this.dataReader.fetchSingle();
  }
}
type TStreamMessages = Map<string, Transaction[]>;
