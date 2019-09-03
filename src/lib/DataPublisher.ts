import { asciiToTrytes } from '@iota/converter';
import { API, composeAPI } from '@iota/core';
import Axios from 'axios';
import { MAM_MODE, MAM_SECURITY, MamReader } from 'mam.ts';
import { Mam } from 'mam.ts/out/src';
import { userInfo } from 'os';
import { MamWriter } from '../mam/src';
import { defaultDepth, defaultMwm, defaultNodeAddress } from './config';
import DateTag from './DateTag';
import { hashFromDatetag } from './hashingTree';
import { generateSeed } from './iotaUtils';
import { getNodesBetween } from './treeCalculation';

export class DataPublisher {
  private initialized: boolean;
  private iota: API;
  private seed: string;
  private masterSecret: string;
  private secretMap: Map<string, string>;
  private mamMode = MAM_MODE.RESTRICTED;
  private sideKey: string | undefined;
  private securitsLevel: MAM_SECURITY;
  private writer: MamWriter;
  private currentRoot: string;
  private runInterval;
  private messages: string[] = [];
  private state: boolean = false;
  private dataType: string;
  private fitbitUserId?: string;
  private fitbitAccessToken?: string;

  constructor() {}
  /**
   * init
   */
  public async init({
    masterSecret,
    seed,
    dataType = 'timestamp',
    fitbitUserId,
    fitbitAccessToken,
    securityLevel = MAM_SECURITY.LEVEL_1,
    initialSideKey = 'unsecure',
  }: {
    masterSecret: string;
    seed: string;
    dataType?: string;
    fitbitUserId?: string;
    fitbitAccessToken?: string;

    securityLevel?: MAM_SECURITY;
    initialSideKey?: string;
  }) {
    this.iota = composeAPI({
      provider: defaultNodeAddress,
    });
    this.seed = seed ? seed : generateSeed();
    this.masterSecret = masterSecret;
    this.secretMap = new Map();
    this.securitsLevel = securityLevel;
    this.dataType = dataType;
    this.fitbitUserId = fitbitUserId;
    this.fitbitAccessToken = fitbitAccessToken;
    if (dataType === 'fitbit') {
      if (!(this.fitbitAccessToken && this.fitbitUserId)) {
        throw Error('username or accesstoken not given');
      }
    }
    this.writer = new MamWriter(
      defaultNodeAddress,
      seed,
      this.mamMode,
      initialSideKey,
      this.securitsLevel
    );
    // Object.assign(this.writer.changeMode, modifiedChangeMode);
    this.currentRoot = this.writer.getNextRoot();
    await this.writer.catchUpThroughNetwork();
    this.initialized = true;
  }
  /**
   * isRunning
   */
  public isRunning() {
    const state = this.runInterval ? true : false;
    this.state = state;
    return state;
  }
  /**
   * getNextRoot
   */
  public getNextRoot() {
    return this.writer.getNextRoot();
  }
  /**
   * run
   */
  public run(interval: number) {
    if (this.runInterval) {
      clearInterval(this.runInterval);
    }
    this.runInterval = setInterval(async () => {
      let txs = [];
      if (this.dataType === 'fitbit') {
        try {
          // tslint:disable-next-line: max-line-length
          const url = `https://api.fitbit.com/1/user/${this.fitbitUserId}/activities/heart/date/2019-05-15/1d/1sec.json`;
          const resp = await Axios.get(url, {
            headers: {
              Authorization: `Bearer ${this.fitbitAccessToken}`,
            },
          });
          console.log(JSON.stringify(resp.data));
          txs = await this.sentMessage(JSON.stringify(resp.data));
        } catch (error) {
          throw error;
        }
      } else {
        txs = await this.sentMessage(new Date().toDateString());
      }
      this.messages.push(txs[0].address);
      console.log(`Message published at ${txs[0].address} from ${this.seed}`);
    }, interval);
    this.state = true;
    return this.runInterval;
  }
  public getMessageAddresses() {
    return this.messages;
  }
  /**
   * stop
   */
  public stop() {
    try {
      clearInterval(this.runInterval);
      this.state = false;
      return true;
    } catch (error) {
      return error;
    }
  }
  /**
   * sentMessage
   */
  public async sentMessage(msg: string) {
    if (!this.initialized) {
      throw new Error('not initilized! run init() first');
    }
    const date = new Date();
    const dateTag = new DateTag(
      date.getFullYear(),
      date.getMonth() + 1,
      date.getDate(),
      date.getHours(),
      date.getMinutes()
    );

    const tag = dateTag.toTrytes();
    this.writer.setTag(tag);
    const sideKey = hashFromDatetag(this.masterSecret, dateTag);
    this.writer.changeMode(this.mamMode, sideKey);
    const mamMsg: {
      payload: string;
      root: string;
      address: string;
    } = await this.writer.create(msg);
    try {
      const attachedMsg = await this.writer.attach(
        mamMsg.payload,
        mamMsg.address,
        defaultDepth,
        defaultMwm
      );
      console.log(`
      TagPlain = ${dateTag.toString()} \n
      TagTrytes = ${tag} \n
      transactions = ${attachedMsg.toString()}
      `);
      return attachedMsg;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
