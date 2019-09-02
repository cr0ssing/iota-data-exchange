import { asciiToTrytes } from '@iota/converter';
import { API, composeAPI } from '@iota/core';
import { MAM_MODE, MAM_SECURITY, MamReader } from 'mam.ts';
import { Mam } from 'mam.ts/out/src';
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

  constructor() {}
  /**
   * init
   */
  public async init({
    masterSecret,
    seed,
    securityLevel = MAM_SECURITY.LEVEL_1,
    initialSideKey = 'unsecure',
  }: {
    masterSecret: string;
    seed: string;
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
      const txs = await this.sentMessage(new Date().toTimeString());
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
  }
}
