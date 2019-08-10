import { Transfer } from '@iota/core/typings/types';
import * as IotaJson from '@iota/extract-json';
import DateTag from './DateTag';
import * as ntru from '@decentralized-auth/ntru';
import { EDataTypes, IRequestMsg } from './typings/messages/WelcomeMsg';
/* istanbul ignore file */

// Require the IOTA libraries
// const Iota = require('@iota/core');
// const Converter = require('@iota/converter');
const seed = 'MYIOTASEED';
const keyPair = ntru.createKeyPair(seed);
const pub = keyPair.public;
const pubTryte = ntru.toTrytes(keyPair.public);
const plainText = Buffer.from(
  'helloWorldFromAVERylongStringshouldchange',
  'utf8'
);
const encrypted: string = ntru.encrypt(
  plainText,
  ntru.toTrytes(keyPair.public)
);
const decrypted: string = ntru.decrypt(encrypted, keyPair.private).toString();
console.log(encrypted, decrypted, encrypted.length);
// Create a new instance of the IOTA object
// Use the `provider` field to specify which IRI node to connect to
// const iota = Iota.composeAPI({
//   // provider: 'https://nodes.devnet.iota.org:443',
//   provider: 'https://nodes.thetangle.org:443',
// });

// const address =
//   'AAAAAWORLDHELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDDWXHNRIGPX';

// const seed =
//   'PUEOTSEITFEVEWCWBTSIZM9NKRGJEIMXTULBACGFRQK9IMGICLBKW9TTEVSDQMGWKBXPVCBMMCXWMNPDX';

// const requestMsg: IRequestMsg = {
//   dataType: EDataTypes.heartRate,
//   endDate: new DateTag(2019, 12, 15),
//   nextAddress: address,
//   pubKey: 'ABC',
//   startDate: new DateTag(2019, 5, 10),
// };
// const msgStr = JSON.stringify(requestMsg);
// const msgStr2 = JSON.stringify(requestMsg, null, 1);
// const message = Converter.asciiToTrytes(msgStr2);
// const tagStr = requestMsg.startDate.toString();
// const msgDec = Converter.trytesToAscii(message + '99');
// // const msgDecJson = JSON.parse(msgDec);
// const TAG = Converter.asciiToTrytes(tagStr);
// const transfers: Transfer[] = [
//   {
//     value: 0,
//     tag: TAG,
//     address,
//     message,
//   },
// ];

// iota
//   .prepareTransfers(seed, transfers)
//   .then(trytes => {
//     return iota.sendTrytes(trytes, 3 /*depth*/, 14 /*MWM*/);
//   })
//   .then(bundle => {
//     const JSONBundle = JSON.stringify(bundle, null, 1);
//     console.log(`Bundle: ${JSONBundle}`);
//     const json = IotaJson.extractJson(bundle);
//     const jsonParse = JSON.parse(json);
//     const decMsg = Converter.trytesToAscii(bundle.signatureMessageFragment);
//     const decMsgParse = JSON.parse(decMsg);
//     console.log(decMsgParse);
//   })
//   .catch(err => {
//     // Catch any errors
//     console.log(err);
//   });
