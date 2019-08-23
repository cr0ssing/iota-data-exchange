import {
  API,
  composeAPI,
  createFindTransactions,
  createGetTransactionObjects,
} from '@iota/core';
import { Provider, Transaction } from '@iota/core/typings/types';
import { createHttpClient } from '@iota/http-client';
import { MAM_MODE, MamReader } from 'mam.ts';
import { hash } from 'mam.ts/out/src/hash';
import { Decode } from 'mam.ts/src/Decode';
import { defaultNodeAddress } from './config';
import HashStore, { HashList } from './HashStore';
import { dateTagFromTxTag, tagTrytesToDateTag } from './helpers';
import { IHashItem } from '../typings/HashStore';

export default class MamReaderExtended {
  protected providerConf: Provider;
  protected mamMode: MAM_MODE;
  protected readerSiedeKey: string;
  protected hashStore: HashStore;
  protected reader: MamReader;
  protected iota: API;
  constructor({
    provider,
    root,
    mode = MAM_MODE.PUBLIC,
    sideKey,
    hashList,
  }: {
    provider: string;
    root: string;
    mode?: MAM_MODE;
    sideKey?: string;
    hashList?: HashList;
  }) {
    this.reader = new MamReader(provider, root, mode, sideKey);
    this.providerConf = createHttpClient({ provider });
    this.iota = composeAPI({
      provider: defaultNodeAddress,
    });

    this.mamMode = mode;
    this.readerSiedeKey = sideKey;
    this.hashStore = new HashStore(hashList);
  }

  public async decodeTagAndDecrypt() {
    const address = this.reader.getNextRoot();
    const hashedAddress = hash(address);
    // Get the next set of transactions send to the next address from the mam stream
    const txs = await this.iota.findTransactionObjects({
      addresses: [hashedAddress],
    });
    const tag = dateTagFromTxTag(txs[0].tag);
    return tag;
  }
  /**
   * getMessage
   */
  public async getMessage() {
    const tag = await this.decodeTagAndDecrypt();
    const key = this.hashStore.getKeyFromDatetag(tag);
    this.reader.changeMode(this.reader.getNextRoot(), this.mamMode, key);
    const msg = await this.reader.fetchSingle();
    return msg;
  }
}
