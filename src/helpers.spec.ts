import { createKeyPair, iotaFromTrytes } from '@decentralized-auth/ntru';
import { asciiToTrytes, trytesToAscii } from '@iota/converter';
import { composeAPI } from '@iota/core';
import { AES, enc } from 'crypto-js';
import { readFile, readFileSync, writeFileSync } from 'fs';
import DateTag from './DateTag';
import { dateTagFromBinStr } from './helpers';
import { generateSeed, parseWelcomeMessage } from './iotaUtils';
import { ISubscription } from './SubscriptionStore';
import { EFillOptions } from './typings/Constants';
import { EDataTypes } from './typings/messages/WelcomeMsg';
const iota = composeAPI({
  provider: 'https://nodes.iota.cafe:443',
});

describe('Datetag from binary string generation', () => {
  it('should return the min date', () => {
    const dateMin = new DateTag(2019, 6, 10);
    const dateMinBin = dateMin.toBinStr();
    const dateMax = new DateTag(2019, 6, 11);
    const dateMaxBin = dateMax.toBinStr();
    const dateBinCheck = dateMinBin.substring(0, dateMinBin.length - 1) + 'X';
    const resMin = dateTagFromBinStr(dateBinCheck, EFillOptions.MIN);
    const resMax = dateTagFromBinStr(dateBinCheck, EFillOptions.MAX);
    expect(resMin).toStrictEqual(dateMin);
    expect(resMax).toStrictEqual(dateMax);
  });
});
describe('Parsing a Welcome Message Bundle', () => {
  it('should reveal the original message', async () => {
    jest.setTimeout(30000);

    const seed =
      'HEEAXLXPIDUFFTLGNKQQYUNTRRCTYRSFOOFXGQRKNVEPGXWLURNXZPFCBVBCZRAKRMSXAGTNLTXMRPYDC';
    const keyPair = await createKeyPair(seed);
    const tryt = await iota.getBundle(
      'LRKFQRWVLFMSRJNMUBDDMFPHOZJUOOXFMCZRXQLGMVRO9PCSMMDNDYFFACRURXRPRIWZPMUHCY9I99999'
    );

    const messagepayload = await parseWelcomeMessage(tryt, keyPair.private);
    const messagepayloadJson = JSON.parse(messagepayload);
    expect(messagepayloadJson.length).toStrictEqual(6);
  });
});
describe('AES Encryptin with trytes', () => {
  it('should be the same before and after convertion', () => {
    const secret = 'mySecret';
    const someTest = 'SomeTextToencyrpt';
    const msgEnc = AES.encrypt(someTest, secret).toString();
    const msgEncTryte = asciiToTrytes(msgEnc);
    const msgDecFromTryte = trytesToAscii(msgEncTryte);

    const msgDecBytes = AES.decrypt(msgDecFromTryte, secret);
    const msgDecString = msgDecBytes.toString(enc.Utf8);
    expect(msgEnc).toStrictEqual(msgDecFromTryte);
    expect(someTest).toStrictEqual(msgDecString);
  });
  it('should decrypt message from static input', () => {
    const secret = 'SomeSecret';
    const tagTrytes = 'WAABWABBRAWAUACB9B999999999'.replace(/9*$/, '');
    const tagString = trytesToAscii(tagTrytes).split('-');
    const secretTrytes =
      '9DUAKBHC9DDDXBQBTAJDVAKDYAUCBBCBMBDCDCSCJDQCXCCDZAUCECDDWAKBOBWAABWBNBTBECSCLBFDHDVAXCECYBCDTAYBIDABNBHCZCACZBDCGDLDGDDCSCBBPAHDZAUBGDAC9DWCTCUAFCDDDDTCABGCZCLBSCADTBLBVA9DYBCDCCCDECQCYAJDICPATCZBZBKDCBXAXCECXBQCFCRC9DUCLBYCACZBECYCQBVCQCZCYCOBWAFDKBXBWCWAPCUBGCVADCTCPBFCFD9DDCKBZAKBICKBUCND9BPCHDZACCXBABTBICTAFC9BICQCTAADKDQBSCEDYAFDUCFDLDQBNBUBADNDIDWBVBOBDDFCMDPCVAMBECUBDDOBYCIDADWCXBVCMDDCNDBDWCOBFDKDQCACTCZBKBQBOBWCEDTAWCTBOBLDIDADZBNDXCZCECJDFD9DLDWAICAD9CFCBDKDVCCBLDXBKDWCCCPBKBTBHDVAPAMBUBADZCZCQCMBPCDDEDVAPAGCMBFCTAOBPCUBSBZCMBZBTADCVACCCBOBVAEDHCIDDCYBTAICYARCLDUCZCZBWBBCPBLBJDVBVABBCBNDICYCTAQBOBCDKDSBDCSCYAFCNBYCPCZBUA9DABUBNBIDBBQCADMDUARBKDCDBBNDGCZBTACDDDSBZCTCWAPCYBABZAMDTADDRCACIDMBCD9DTBPAXCXAFCHCIDSBUBRCBBUCVCGDUCHCVCIDVBSCTC9BIC9CADEDGCGCJDJDZAVBXAFCYBWATCYCDDBBJDFDLDACOBCDABABYARCKBZABCUBVCUCSCSCRCLBKBDDNDKDADPACBDCGDXBWBXBUBBDVCWBGCGCPCYATCMDTCBCCDOBDDRCWCFDZCZADCECVCHCLBYA9DWBWAIDIDICCD9CVCNBTBWAPBTBIDRBCDFDSBBDWCLDHCCBMDVBSBADXBDDLBFDUCRCSCTBWBECICCCBCTCYBCDWAGCPCZAJDLDFDFCZCCDVCBCRCJDXC9CMDUBYCCCNDYCWAACVCCDVCFDBCTAHCDDSCLDOBDCKBZBABHDTBQBICXAPBWCTCBCEDCCICWBEDACCBMBYAUCXAMBPCRBUAKDMBQBNDACKBZCQBXAKDWCQCDCCDTAYBUBVAQBQCUALDXBFDYBGDZACBHDMBZBXBADMBDCWB9D9DQBMDIDPATAVCPBHDQCYCWB9CDDAB9CADZAPBRBNDUAWBYBQCNDDDVABDJDDCXC9DUAIDHDBBRCCDTADCDCBCCBCBRBQBICWBCDLDSCPCBDBDMBHDLBCCZBPAZCDCNDWBYCECUA9DZCDCLDSBDDPBBCVAGDEDHDSCABGDHCBDXBZAGCQBHDIDIDPCBCVABDZABCZBQBZCUAECXBBBCDCDVACDRBVABDFCVCBBDCNDDDYBHCQCRBFD9CADZCDCCBBBFCUBABWBXBFCWCOBBDNDCDRCPAKBECOBWCABYC9CQCADXBCCTBUAECGDXCTCJDBCLBJDECKDQCFCQC9BBBPCWAGDXCKB9DFDECZBTBFC9BGCFDUAWBRBZAVASCRBVBUAVBDCSBMDXABCCDPAHDQCGCWCIDKDFCUBADZBFDCDOBPCTCYCMBUBPBUAWBZAVAFDICJDSCFC9DCBVCXBVAFDBCWCCDYBWCSBZAWAQB9D9CADACYC9COBGCQBECRBUCJDVACDYBYADDACPA9DDCPCOBYCWCYAHCXBBBAC9BDCCBLDXBZBHDUAJDTAVCLBICPCSCZCSBRCKDMDVCNDQCJDXBICYBKDACLBRBJDFDBDUAACQBDCXBBBTCHDHDQBNDADPA9BZBQBRCGDECOBPBWCID9BJDUC9DND9BYCDDVAYAUAPCNBRCPCEDABECDDHDADQBEDADNDHCADRBNBHCIDCD9CXBOB9BBDYBPCICXBADABYCIDUCDCFDTBFCKDLBICZANDIDZCZAUBTBVBPBBDDCSBPBKBPAYAABKBHDOBHDGC9CBCACBDGCUCDDDDVAXBCBQBQCSB9CSBTBUAXANDPAOBDDTCRBXBBCRCPAYBHCPBKDADSBSCYCMDEDXBBCBDHC9CACFDKBBBCDICWAECLBYAQBICFCWBPCKDUAMBQBDDPAGCHDECWC9BJDLDZAMBCDMDQBVCICZB9DSBWADDECHCFDZBBB9BDDABWBPCNBLBYAKBICFDCDXCVCVAVCVACCWCXBLBEDADXBLDTCGDZBBC9BNDADZBICECYBFCWBVBZBCBACGCRBACPAVAOB9DADJDZCWCQCYAJDGCGCBBNDMBVBYBHCECYCGDYAACBCBDVBPCKBSBXCPCWAVCZBXB9DABCBJDZBHCVCZC9BBCTADDCBNBPASBDCXCMDTCBBACCCABXCXBED9DABNDFCEDHCGDYBECDDKDVBVBZCABUAFCZA9CSBYALB9BACZCJDXCWAVCRBDDTAMDLBGDHDXAFCFCZAZBXAZCJDADNDZBUCYBMBHDXABDXBNDQBTCCCQBOBWA9C9BFDABECBB9CACPCLDCBBBICIDIDFDKBZBDDZBFC9BCBKDPBLDJDYAQCFDZBBBUCUCWBABVALBBBBDECQC9BQCCCWCPCSBPA9CWAJDMD9BZBFDOBMBGCYACBHDTBWBACBBCDUCZAQBBBACVBYCEDFDMBYATCZBZAXBFDDDWCQCCDXCTCZBADRCPCYBPARBDDFDIDVCGB';
    const msgTrytes =
      'DCWAPBGDSCQBECZCGCVAPAUCPCVCPCQBEDUBECDDLDMDUCBBPATAXBUA9DVAADKBSCCBMDEDABGDLBBCABPBPCLDOBSBJDWAFCZBXBQB9BMDCCTALDMBHDFCRCCDWBECBBMDYBZBMBZANBACDDWBNDCCBBEDTASCMBBCZBXCCBJDTAXARBKDUCZCWBQCDCACWBSCHCWCVBHCQBYBRBOB9DFDECVBUBBBCC9CPACCJDHCZCGDPCACQBED9BZCFDYBKBBCZCQCBCABABUB9BPAPANDUAUABDOBUCTCCDIDUBWANBVCWBCCDDZBRBUAUCUBCDHDXC9DKBVAUB9BZBBDYAWBKBGDRCWCDDLBFDOBLD9D9BYCVBIDLBUBZCXBSCEDABVBKD9DKDUANDEDIDCDQCEDFCKDUAPBQBTAPAXCWAND9DFC9BZBLDFCNDMBVADDCDWCKBVBVAXCUBUAVBOBZAWAZAUAQBFDZBBBLBIDVAUCTCICMBVACB9DWBTAHDUAHDNBNDICOBHCNBRBLBDDPAHCTBPBKBLDLDFDDCECPATBDDNDSBUACDNDYAGCEDHDWAWCCBBCYAEDLDTCJDABSBUAWBDCUBCDBCTCRCDCTBADLDXCICYBVBPACDBCUALBPBNBBBDC9DXAMDGCSBABDDMDNDNBIDTAWCRCUCSCTCZAABKBWCCBMDMBCDQCZCUBWBUCOBPBICZBXAKBKBPCUACBYBOBECUAMDKDVA9CNDHDQBDDBBUCRBXBUAXCLBYBNBWCZBPBEDJDHC9BOBIDBD9CJDMDOBVBACCDRC9BFC9BHDOBXATC9DYBRCBCBB9CMBZBCCABVAUANDPBVCSBYAZCLDFCLBPAKBDDECUBNBWAPAVCDDGDZBMDZAYBWAFDUAQCADFDVASBXAPAXCPAWCPBTADD9DJDCD9BGCSCUAYBYCIDPAPBPAGCZBPAUCNBYBYCEDBCYAHCXBWAWAHCVCCCKDLDTCMDSBADZCPCHDUAZBUASBTASBZBDC9DZCSCADYCZCHDGDCDPCCBBBEDXBLDSCMBTANDGDKDPAECRCRCCD9CGCQCZBBBXBQBDDABTCCCZAGDZCNBPAGCQBZAYBNDSBICWCRBDCVBMBXAVBBBDCKDRBYBFDADVBPBQBWBQBNBZAABRBIDYAACZBACFCABOBCBBDQBYC9DBCKBWABBADLDSC9DVBZBECMBYBABECNBVAGDZAMDECLDACXAYA9CBDHDTAABNBHDVANDCBPAICJDMBKBTBDDYABDZAYC9DWBLDZASCICMBMBFDGCBCTBXBIDHCUASCYBHCKDUBYC9CZABBIDRBYCYAWAVBYADCQBYBWAVBXCUABBICXCXACBDD9BFDZBACRBDCPBZADCKDJDABXAFDHDXCXBECZBWCPATAWBACGCGDQCKBTALBZBQCEDBC9DUBRCYCVARCNDUBPBUBCBECDDFCGDGDWBYBLBQCCDVCZASCFDICADYBDDHCQCABZBXAVC9DBCABICLBRBUCNDQBZAABYAEDACNBQCKBKD9CVAZB9B9DZAFCIDCBNDIDSCBCXBXBZCYCUBRCRBTCHCMBLDCCJDWCYBKBDDKBJDNBPCMDXBDDKDGDJDICDDXCNDVAFCBDDCPBADZCXC9BACTCFCABCBFDYBPABCZASCIDYCCBDDYAMBNDCBFCACGCTCVCKDPAFCDCJDFDRBBCQCBCVANBCBXCECWAWBUCSBWCJDMBPCSCDDDCKDFCADNB9CKBWAIDTBIDBDSCPA9DID9CGDJDJDFCPCACWBEDPCVASBUAECWCTCMDMDECBBWCYCWCGCPCXCOBICVAYA9CDCOBMDPC9CCCGDZBADHDFDUCCDFCGCJDICBDXCTAPBCCGCXCPAEDVAFDDCXBQBYCTCKDOBICRBTAWABCNBLDVCPBFCHCPAOBUCHDUBFCADWCLDLBECWCSCMBCDUCRCLBCDXBSCYBVBBDFCCCUCUCHDWAUAZBBBHCSCCDOBDDPAXCABQCHDBCABCBZAPBCDVANBSCYACDYBZCADHCWCSBQCLDRCXACDVBUBACYBVBMBZBICXBTCMBNBUAKDGBGB';
    const msgDecFromTryte = trytesToAscii(msgTrytes);
    const msgDecBytes = AES.decrypt(msgDecFromTryte, secret);
    const msgDecString = msgDecBytes.toString(enc.Utf8);
    const decObj = JSON.parse(msgDecString);
    expect(msgDecString).toBe(
      '[{"hash":"XZ9BIZNUEDVCIRSUQWNDTLTYUVNFPUOGAYPXP9EYFCBBCGYKKKGGLYIOGJZCKIIQFZEUJIZCFGJWQNTWF","prefix":"00011111100011011101111"},{"hash":"X9EBYBHOXFHRCWHBFTUPLJCSLIRKQIWLVIOQX9KCF9UBPMDTVXPVZIPYQLDDNGQNTQDTXHSPHBRHGZESH","prefix":"0001111110001101111XXXX"},{"hash":"NMIAAHOJSMNEBMAXTCQQ9FW9BTYRUVSKQLWFYFCWDDPFGDCHOSQRNWZOMWJFZYLDQGMQHQU9NTJTKTNTC","prefix":"00011111100011100100XXX"},{"hash":"SVBPVQ9UBNKBACBMJMAJNZXGGTK9WQAUYSMHNGPFXDQUPCAJUXHFOAGEWATDPWSEKJKUAPNGMVQXLITOH","prefix":"00011111100011100101010"},{"hash":"BBOAXQHXIARXKSILOOUIATOTJV9QOZGGDNZQZLDBCUXPMRERKMU9ZPIEFLCCENISCOOZXFONKTAE9TSZP","prefix":"0001111110001110010100X"},{"hash":"GBTNNACDMWGJFHSGWJQOBAPOUOUWAT9BVENRTSVYJSAX9VLLV9OJWNZYYKFOUGUFXZUGOBRYDDMHMLNAV","prefix":"000111111000111000"}]'
    );
  });
});
