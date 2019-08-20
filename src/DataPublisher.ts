import { API, composeAPI } from '@iota/core';
import { MAM_MODE, MAM_SECURITY, MamReader, MamWriter } from 'mam.ts';
import { defaultDepth, defaultMwm, defaultNodeAddress } from './config';
import DateTag from './DateTag';
import { hashFromDatetag } from './hashingTree';
import { generateSeed } from './iotaUtils';
import { getNodesBetween } from './treeCalculation';

export default class {
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
  constructor() {}
  /**
   * init
   */
  public async init({
    initialSideKey = 'unsecure',
    masterSecret,
    securityLevel = MAM_SECURITY.LEVEL_1,
    seed,
  }: {
    initialSideKey: string;
    masterSecret: string;
    securityLevel: MAM_SECURITY;
    seed: string;
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
    this.currentRoot = this.writer.getNextRoot();
    await this.writer.catchUpThroughNetwork();
    this.initialized = true;
  }
  /**
   * getNextRoot
   */
  public getNextRoot() {
    return this.writer.getNextRoot();
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
      date.getDate()
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
    return attachedMsg;
  }
}
