import { createKeyPair, KeyPair, toTrytes } from '@decentralized-auth/ntru';
import { EDataTypes } from '../typings/messages/WelcomeMsg';
import DateTag from './DateTag';
import { generateSeed } from './iotaUtils';
import SubscriptionManager from './SubscriptionManager';
import { ISubscription } from './SubscriptionStore';
const seed =
  'HEEAXLXPIDUFFTLGNKQQYUNTRRCTYRSFOOFXGQRKNVEPGXWLURNXZPFCBVBCZRAKRMSXAGTNLTXMRPYDC';

const masterSecret = 'HELLOWORLD';
describe('Constructor', () => {
  let res: SubscriptionManager;
  beforeEach(() => {
    res = new SubscriptionManager({ masterSecret });
  });
  it('should return Manager Object', () => {
    expect(true);
  });
  it('should be initilized with keypair', async () => {
    const keypair: KeyPair = {
      private: new Uint8Array(),
      public: new Uint8Array(),
    };

    const store = new SubscriptionManager({ masterSecret, keyPair: keypair });

    await expect(store.init()).rejects.toThrowError();
  });
  it('should create a keypair', async () => {
    await res.init();
    expect(res.getPubKey()).not.toBe(undefined);
  });
  it('should create a keypair from seed', async () => {
    // tslint:disable-next-line: no-shadowed-variable
    const seed =
      'HEEAXLXPIDUFFTLGNKQQYUNTRRCTYRSFOOFXGQRKNVEPGXWLURNXZPFCBVBCZRAKRMSXAGTNLTXMRPYDC';
    const manager = new SubscriptionManager({
      keyPair: null,
      masterSecret,
      seed,
    });
    await manager.init();
    const pubKey = manager.getPubKey();
    // expect(pubKey).not.toBe(undefined);
    expect(pubKey).toBe(
      // tslint:disable-next-line: max-line-length
      'KB9CWBKBLBWCNBFCGDRBRBGCTAYAXBHDQCZCADBDHDHDVBZCZBZATCFDDCUAKBIDMBPBDD9CKDWCHDVBIDBCZCVCHCBDWAEDEDEDEDOBXCABTAIDZCZBBBGDUARBHD9CQCYCCDWBUBWBIDDCWBZBPBCBNDCBFCVBQBPCTCQBDCSBYBIDABQB9BWBXCCBBDCDWBWCFCNBCBUBADWCIDDC9CVAADBDZANDICIDTAUBUAADVASBLDFDTAYCVBTAZCTBIDKDMBYANDGCFCADXAOBPBXCXCZAGDRBTAKDUAKDEDHDNDHCCDTCZAMDSBWBEDXBFCNBTBPAYBQCCDRCTCXBFDECVBPCFC9DRBSCCDQBLDFDTBKBICTCVCLBVBSBEDWCNBFCICZADC9CECNDMDBDYAEDABABFCJDWCNBCDCDDCWCMDYCWCBDGCTBGCFDNDDDICVCZCICUBSBBBVAVCYAMDXBEDECMBUADCRCBDWAICKBPBLBSCPAWCOBWBRCICVCGCYBLDYAHDYBTAMBBCFDCCHDVACDCCQCICBCUBVANBJD9CWBWBCBFDZBDCUCZCTCMBQCPCXAUAACCDYAJDNDTBWCCCEDNDXCYBKDNDNBWABDUAXCUBPCIDZBKDABGCDCUAGDKDWATCYCFCVAFCXAVCWAXACBYCWCADHDVCQCWADCBDICYBRC9BACJD9DLDMBYBPBRBWBICMBNBKDSBVBQC9CADHDADCDABDCSCWAUCSCQCHCCBZAACTCICRCXAECIDUCXBTCQCXBVCWCTCVAACKDWA9CBDZAGCIDHCTCLDRBXACDYBKDIDWCTBUCFDVBGCTCUBTBUBUCPABBFDPBQCXCFCICGDNBKBPARCACQBCCPCCBXBSCDC9BCBZB9DRCTBOBBCOBADXACCPBZBVAKD9DCBWBNDXB9CVBDCXBBCZCBDCBCDTBXAPAHDZBLD9BCCCCEDGDDDECWBMBMBMDBBOBNDRCVAADADUCIDCBXBKD9BSCPCZC9BEC9DWAZCZAYBACTCEDUARCFCHDSCFDABYCVABDXBNDMDRCTAABEDUCFDYAYCAB9BBBGDKBVCMD9DIDUCJDPCNBWBSBXCKBWBKBUBTCACSBFDECBCZCZCYCCDEDSCPBTAYABCVCYAXBUBFCWCFDYC9CKBNDVBCBWBTBBCUAFDXBNDCCTCHDTBQCZCXBCBVCXBFCFCPBCDUCXBADEDWAQCXAACVCICPBBBNBPCJDYBPAACDCTBCCBCKDLBUACD9DZANBSBWAGDYCABFCJDQBECDCHDACDCUCMBMBZB9DECRBABTBABEDDDFDSCTAWCVATAVCKBCDBCVBMDCCACSCFDCCMD9DABLBXCCBSC9CRCSCLBPBTAGDVC9D9CVCKDXBWAYBZACCNBZADCQCZBWCSBCDHDTCZCKBHCCBMBGDYAGDGCZBVCEDECUCLDWA9CNDXBRBHCSBIDPC9CMBXAPBACEDQB9BBDBBLBKDCBLDBCZBACTADDICZCWAWALBZBTCZCTBRCGDEDZBBDHDUCICVBVCTCYBVCXAEC9BWBFDCBWCPCCBPCUBLBMDVBABXBQBNBWCQCCDPCQCMBHDMDKDICJDLDMDXC9DNDYCACLBKDVBABLDQBVABDGDUCABBCHDYBWAYCQCOBCBECKDDCUAABIDJDXARBWCBBFDRBDCECVBEDACXBCDUCZA9BZAXB9DICIDSCXAKBMDDDBCRCSBICMDZCMDRCKDICVCSBFDLBVCOB9DCDVAVAGDHCPBOBLDNDKBWBBDNBPBQB9DNBHCJDFCHCIDCDWA9DSCYATBMDFDVCWAHCFDACMBGCXCRBCDVBOBYCSCXBRBGDADFCYAACXCBCKD9DMB9CYBYA9CZBUABCPCGD9CWCCCXCHDFCYAFDEDACBBRBXCKBVBSBSBJDTCGCBDPBUACBHDUBWBKDUASBDCOBGDRCGDUBWAPASBZAQBEDABOB9DWCMDTAUCAD9DTCVBHDTBUBMDWB9DNDHCBCEDBCUA9DVAIDTCZCLBTBTCABZBQCXBACZAWBMDNBNBEDGDSCWATCEDGCZCACADACYAFCADYBBBMBKBNBYCFCJDXCFDCBACHCPATCADVBFCRBADHDXAZCCDBCABPCMDWCLBRBYCYAYCDCPCYBDCQBNBDCBDNBVCECGDPCWCABMBVBSBJDHDWBEDCBXAKDDDXAIDZBDDUCMBDDZCWASCADWAWBPANDCDCCBDECXAFCOBYCXBWB9CNBNDVCTCWBMBQBQBTALBOBBBDDYAWAHDUAFCXCRCADWBWBFCBBKDLDSCMDWARCVBECTCADPBYB9BSBUBTA9BLDDDUBVCXCBCDCWCHCPBPBDDCB9D9DTBBBECGCEDXBWBRCADYB9DVAJDZA9DOBZAWAYCMBNBYBZAXAVAQCHDAC9DFDQBUAZBPBYCYANDYAXASCTAJDXBLBTCZBXCACBDVCBBTBXANDOBUBPBYBPBCD9CBBFDSCWAXCSCVCCCGDXATANDVCTCCDIDKBBCKB9CACOBYCOBUCQBBCUANBVBECQBHCXAWALDDCQCCCTBBCBBDDEDUCWCXCPATCMBPAWBLBWBRBTBUAFCCBJDNDJDXBVADDHDIDWBYBTBFCIDQB9DIDYBZBHDADLBYBNBTAYAWAVBXAADBBLBQCCCGD9DADTBNDBCOBMBKBSBECKBUAFDRBJDQCCBBDYAUAZATBWAVBBCSCTBMBKBGBGB'
    );
  });
  it('should create the same pubKey from same seed', async () => {
    // tslint:disable-next-line: no-shadowed-variable
    const seed =
      'HEEAXLXPIDUFFTLGNKQQYUNTRRCTYRSFOOFXGQRKNVEPGXWLURNXZPFCBVBCZRAKRMSXAGTNLTXMRPYDC';
    const manager = new SubscriptionManager({
      keyPair: null,
      masterSecret,
      seed,
    });
    await manager.init();
    const manager2 = new SubscriptionManager({
      keyPair: null,
      masterSecret,
      seed,
    });
    await manager2.init();
    const pubKey = manager.getPubKey();
    const pubKey2 = manager.getPubKey();
    // expect(pubKey).not.toBe(undefined);
    expect(pubKey).toStrictEqual(pubKey2);
  });
  it('should create no a keypair', async () => {
    expect(res.getPubKey()).toBe(undefined);
  });
  it('should coonect to tangle', async () => {
    res.connectToTangle();
    const nodeInfo = await res.iota.getNodeInfo();
    expect(nodeInfo).not.toBe(undefined);
  });
});

describe('Fetching Access Requests from Tangle', () => {
  let res: SubscriptionManager;
  beforeEach(() => {
    res = new SubscriptionManager({ masterSecret });
    res.init();
    res.connectToTangle();
  });
});

describe('Sending Request accept message', () => {
  it('should create a valid message', async () => {
    jest.setTimeout(30000);

    const manager = new SubscriptionManager({
      keyPair: undefined,
      masterSecret,
      seed,
    });
    await manager.init();
    const keyPair = createKeyPair(generateSeed());
    const subscription: ISubscription = {
      dataType: EDataTypes.heartRate,
      endDate: new DateTag(2019, 9, 10),
      pubKey: toTrytes(keyPair.public),
      responseAddress: generateSeed(),
      startDate: new DateTag(2019, 7, 15),
      startRoot: '',
    };
    const msg = await manager.sentRequestAcceptMsg(subscription);
    expect(msg).not.toBe('');
  });
});
describe('Fetching subscription Request', () => {
  it('should return several bundles', async () => {
    const manager = new SubscriptionManager({
      keyPair: null,
      masterSecret,
      seed,
    });
    await manager.init();
    const requestBundles = await manager.fetchSubscriptionRequests();
    expect(requestBundles).not.toBe('');
  });
});
