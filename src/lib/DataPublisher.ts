import { asciiToTrytes } from '@iota/converter';
import { API, composeAPI } from '@iota/core';
import Axios from 'axios';
import { MAM_MODE, MAM_SECURITY, MamReader } from 'mam.ts';
import { Mam } from 'mam.ts/out/src';
import { userInfo } from 'os';
import * as qs from 'querystring';
import { MamWriter } from '../mam/src';
import {
  defaultDepth,
  defaultMAMSecurity,
  defaultMwm,
  defaultNodeAddress,
  tagDateFormat,
} from './config';
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
  private fitBitAuthCode?: string;
  private fitbitAccessToken?: string;
  private fitbitRefreshToken?: string;
  private performanceMap: Map<string, any>;
  private powApiKey: string;
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
    securityLevel = defaultMAMSecurity,
    initialSideKey = 'unsecure',
    powApiKey = '',
  }: {
    masterSecret: string;
    seed: string;
    dataType?: string;
    fitbitUserId?: string;
    fitbitAccessToken?: string;

    securityLevel?: MAM_SECURITY;
    initialSideKey?: string;
    powApiKey?: string;
  }) {
    this.iota = composeAPI({
      provider: defaultNodeAddress,
    });
    this.seed = seed ? seed : generateSeed();
    this.masterSecret = masterSecret;
    this.secretMap = new Map();
    this.performanceMap = new Map();
    this.securitsLevel = securityLevel;
    this.dataType = dataType;
    this.fitbitUserId = fitbitUserId;
    this.fitBitAuthCode = fitbitAccessToken;
    this.fitbitAccessToken = '';
    this.fitbitRefreshToken = '';
    this.powApiKey = powApiKey;
    if (dataType === 'fitbit') {
      if (!(this.fitBitAuthCode && this.fitbitUserId)) {
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
    if (this.powApiKey && this.powApiKey !== '') {
      this.writer.EnablePowSrv(true, this.powApiKey);
    }
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
  public async run(interval: number) {
    if (this.runInterval) {
      clearInterval(this.runInterval);
    }
    let startTime = 0;
    let endTime = 0;
    let hrTime;
    try {
      if (this.dataType === 'fitbit' && !this.fitbitAccessToken) {
        const authResponse = await Axios.post(
          'https://api.fitbit.com/oauth2/token',
          qs.stringify({
            clientId: '22B8MH',
            grant_type: 'authorization_code',
            redirect_uri: 'http://localhost:9999',
            code: this.fitBitAuthCode,
          }),
          {
            headers: {
              Authorization:
                'Basic MjJCOE1IOjdkMGFkMWE0YzJjYWY1YTI5MjliZGY3ZDNiOTM2MGE5',
              'Content-Type': 'application/x-www-form-urlencoded',
              'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.120 Safari/537.36',
            },
          }
        );
        this.fitbitAccessToken = authResponse.data.access_token;
        this.fitbitRefreshToken = authResponse.data.refresh_token;
        this.fitbitUserId = authResponse.data.user_id;
      }
      this.runInterval = setInterval(async () => {
        let txs = [];
        if (this.dataType === 'fitbit') {
          try {
            // tslint:disable-next-line: max-line-length
            const date = new Date();
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            const day = date.getDate();
            const startHour = date.getHours() >= 1 ? date.getHours() - 1 : 0;
            const endHour = date.getHours() >= 1 ? date.getHours() - 1 : 0;
            const minutes = date.getMinutes() > 0 ? date.getMinutes() - 1 : 0;
            const startMin =
              minutes >= 10 ? minutes.toString() : '0' + minutes.toString();

            const endmin =
              date.getMinutes() >= 10
                ? date.getMinutes().toString()
                : '0' + date.getMinutes().toString();
            const url = `https://api.fitbit.com/1/user/${
              this.fitbitUserId
            }/activities/heart/date/${year}-${
              month >= 10 ? month : '0' + month
            }-${
              day >= 10 ? day : '0' + day
            }/1d/1sec/time/${startHour}:${startMin}/${endHour}:${endmin}.json`;
            console.log(url);
            let resp;
            try {
              resp = await Axios.get(url, {
                headers: {
                  Authorization: `Bearer ${this.fitbitAccessToken}`,
                },
              });
              const refreshToken = await Axios.post(
                'https://api.fitbit.com/oauth2/token',
                qs.stringify({
                  grant_type: 'refresh_token',
                  refresh_token: this.fitbitRefreshToken,
                }),
                {
                  headers: {
                    Authorization:
                      'Basic MjJCOE1IOjdkMGFkMWE0YzJjYWY1YTI5MjliZGY3ZDNiOTM2MGE5',
                    'Content-Type': 'application/x-www-form-urlencoded',
                  },
                }
              );
              this.fitbitAccessToken = refreshToken.data.access_token;
              this.fitbitRefreshToken = refreshToken.data.refresh_token;
              console.log(refreshToken.data);
            } catch (error) {
              const refreshToken = await Axios.post(
                'https://api.fitbit.com/oauth2/token',
                qs.stringify({
                  grant_type: 'refresh_token',
                  refresh_token: this.fitbitRefreshToken,
                }),
                {
                  headers: {
                    Authorization:
                      'Basic MjJCOE1IOjdkMGFkMWE0YzJjYWY1YTI5MjliZGY3ZDNiOTM2MGE5',
                    'Content-Type': 'application/x-www-form-urlencoded',
                  },
                }
              );
              this.fitbitAccessToken = refreshToken.data.access_token;
              this.fitbitRefreshToken = refreshToken.data.refresh_token;

              resp = await Axios.get(url, {
                headers: {
                  Authorization: `Bearer ${this.fitbitAccessToken}`,
                },
              });
            }
            hrTime = process.hrtime();
            startTime = hrTime[0] * 1000000 + hrTime[1] / 1000;
            txs = await this.sentMessage(JSON.stringify(resp.data));
            hrTime = process.hrtime();
            endTime = hrTime[0] * 1000000 + hrTime[1] / 1000;
          } catch (error) {
            console.log(error);
            throw error;
          }
        } else {
          hrTime = process.hrtime();
          startTime = hrTime[0] * 1000000 + hrTime[1] / 1000;

          txs = await this.sentMessage(new Date().toDateString());
          hrTime = process.hrtime();
          endTime = hrTime[0] * 1000000 + hrTime[1] / 1000;
        }
        this.messages.push(txs[0].address);
        console.log(
          `Message published at ${txs[0].address} from ${
            this.seed
          } which took ${endTime - startTime}`
        );
      }, interval);
      this.state = true;
      return this.runInterval;
    } catch (error) {
      console.error(error);
    }
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
  public async sentMessage(msg: string, format: string = tagDateFormat) {
    if (!this.initialized) {
      throw new Error('not initilized! run init() first');
    }
    let hrTime = process.hrtime();
    const beginning = hrTime[0] * 1000000 + hrTime[1] / 1000;

    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    let hour;
    let minute;
    let second;
    if (format === 'YMDH') {
      hour = date.getHours();
    }
    if (format === 'YMDHM') {
      hour = date.getHours();
      minute = date.getMinutes();
    }
    if (format === 'YMDHMS') {
      hour = date.getHours();
      minute = date.getMinutes();
      second = date.getSeconds();
    }

    const dateTag = new DateTag(year, month, day, hour, minute, second);

    const tag = dateTag.toTrytes();
    this.writer.setTag(tag);
    hrTime = process.hrtime();
    const startSidekeyCalculation = hrTime[0] * 1000000 + hrTime[1] / 1000;
    const sideKey = hashFromDatetag(this.masterSecret, dateTag);

    hrTime = process.hrtime();
    const endSidekeyCalculation = hrTime[0] * 1000000 + hrTime[1] / 1000;
    console.log(
      `key caluclation took: ${endSidekeyCalculation - startSidekeyCalculation}`
    );
    this.writer.changeMode(this.mamMode, sideKey, defaultMAMSecurity);
    hrTime = process.hrtime();
    const startCreateMessage = hrTime[0] * 1000000 + hrTime[1] / 1000;

    const mamMsg: {
      payload: string;
      root: string;
      address: string;
    } = await this.writer.create(msg);
    hrTime = process.hrtime();
    const endCreateMessage = hrTime[0] * 1000000 + hrTime[1] / 1000;

    try {
      hrTime = process.hrtime();
      const startAttachMessage = hrTime[0] * 1000000 + hrTime[1] / 1000;

      const attachedMsg = await this.writer.attach(
        mamMsg.payload,
        mamMsg.address,
        defaultDepth,
        defaultMwm
      );
      hrTime = process.hrtime();
      const endAttachMessage = hrTime[0] * 1000000 + hrTime[1] / 1000;

      console.log(`
      TagPlain = ${dateTag.toString()} \n
      TagTrytes = ${tag} \n
      transactionBundle = ${attachedMsg[0].bundle}
      `);
      const performance = {
        messageType: this.dataType,
        sideKeyCalculation: endSidekeyCalculation - startSidekeyCalculation,
        createMessage: endCreateMessage - startCreateMessage,
        attachMessage: endAttachMessage - startAttachMessage,
        overall: endAttachMessage - beginning,
        node: defaultNodeAddress,
        mwm: defaultMwm,
        depth: defaultDepth,
        tagTrytes: tag,
        tagPlain: dateTag.toString(),
        mamSecurity: defaultMAMSecurity,
      };
      this.performanceMap.set(attachedMsg[0].bundle, performance);
      return attachedMsg;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
