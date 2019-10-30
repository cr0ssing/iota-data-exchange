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
import { IHashItem } from '../typings/HashStore';
import {
  defaultDepth,
  defaultMAMSecurity,
  defaultMwm,
  defaultNodeAddress,
} from './config';
import HashStore, { HashList } from './HashStore';
import { dateTagFromTxTag, tagTrytesToDateTag } from './helpers';

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
  /**
   * getNextRoot
   */
  public getNextRoot() {
    return this.reader.getNextRoot();
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
    let hrTime = process.hrtime();
    const startTime = hrTime[0] * 1000000 + hrTime[1] / 1000;

    const tag = await this.decodeTagAndDecrypt();

    hrTime = process.hrtime();
    const decodeTagAndDecrypt = hrTime[0] * 1000000 + hrTime[1] / 1000;

    const key = this.hashStore.getKeyFromDatetag(tag);
    hrTime = process.hrtime();
    const getKeyFromDatetag = hrTime[0] * 1000000 + hrTime[1] / 1000;

    const root = this.reader.getNextRoot();
    hrTime = process.hrtime();
    const getNextRoot = hrTime[0] * 1000000 + hrTime[1] / 1000;

    this.reader.changeMode(root, this.mamMode, key);
    hrTime = process.hrtime();
    const changeMode = hrTime[0] * 1000000 + hrTime[1] / 1000;

    try {
      const msg = await this.reader.fetchSingle();
      hrTime = process.hrtime();
      const fetchSingle = hrTime[0] * 1000000 + hrTime[1] / 1000;
      const performance = {
        overall: fetchSingle - startTime,
        decodeTagAndDecrypt: decodeTagAndDecrypt - startTime,
        getKeyFromDatetag: getKeyFromDatetag - decodeTagAndDecrypt,
        getNextRoot: getNextRoot - getKeyFromDatetag,
        changeMode: changeMode - getNextRoot,
        fetchSingle: fetchSingle - changeMode,
        node: defaultNodeAddress,
        mwm: defaultMwm,
        depth: defaultDepth,
        mamSecurity: defaultMAMSecurity,
      };
      return { root, msg, tag, performance };
    } catch (error) {
      console.log(error);
      console.log(`
      Faild at getting Message
      root: ${root}
      tag: ${tag}
      key: ${key}`);
      throw error;
    }
  }
}
