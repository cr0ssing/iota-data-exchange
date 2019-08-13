import { createKeyPair, KeyPair, toTrytes } from '@decentralized-auth/ntru';

import { tritsToTrytes, trytesToTrits } from '@iota/converter';
import { Address, API, Bundle, composeAPI, Transaction } from '@iota/core/';
import { generateKeyPair } from 'crypto';
import DateTag from './DateTag';
import { hash, hashCurl } from './hashingTree';
import { generateSeed, sentMsgToTangle } from './iotaUtils';
import {
  EDataTypes,
  IRequestMsg,
  IWelcomeMsg,
} from './typings/messages/WelcomeMsg';

export default class {
  private seed: string;
  private keyPair: KeyPair;
  private requests: IRequestsState;
  private iota: API;
  constructor(parameters) {
    this.iota = composeAPI({
      provider: 'https://nodes.iota.cafe:443',
    });
    this.seed = parameters.seed ? parameters.seed : generateSeed();
  }
  /**
   * init
   */
  public async init() {
    this.keyPair = await createKeyPair(this.seed);
  }
  /**
   * publishPubKey
   */
  public async publishPubKey(): Promise<Bundle> {
    const pubKeyTryte = toTrytes(this.keyPair.public);
    const pubKeyAdd = tritsToTrytes(hashCurl(trytesToTrits(pubKeyTryte)));
    const tanglePubKey: Transaction[] = await this.iota.findTransactionObjects({
      addresses: [pubKeyAdd],
    });
    if (tanglePubKey.length > 0) {
      return tanglePubKey;
    } else {
      const msg = await sentMsgToTangle(
        this.iota,
        this.seed,
        pubKeyAdd,
        pubKeyTryte,
        'PUBKEY'
      );
      return msg;
    }
  }
  /**
   * requestAccess
   */
  public requestAccess(start: DateTag, end: DateTag, dataType: EDataTypes) {
    const welcomeMsg: IRequestMsg = {
      dataType: EDataTypes.heartRate,
      endDate: end,
      nextAddress: generateSeed(),
      pubKey: '',
      startDate: start,
    };
  }
}

interface IRequestsState {
  open: [];
  active: [];
  closed: [];
}

interface IDataRecieverRequest {
  state: ERequestState;
  msg: ERequestMessage;
}

enum ERequestState {
  open,
  active,
  closed,
}
enum ERequestMessage {
  IRequestMsg,
}
