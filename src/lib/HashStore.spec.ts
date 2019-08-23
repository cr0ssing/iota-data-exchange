import DateTag from './DateTag';
import { hashFromBinStr, hashFromDatetag } from './hashingTree';
import HashStore from './HashStore';
import { fromYears } from './treeCalculation';
import { IHashItem } from '../typings/HashStore';

describe('HashStore constructor', () => {
  it('should create a Instance', () => {
    const store = new HashStore([{ prefix: 'ABN', hash: 'ASDSAD' }]);
    expect(store).toBeDefined();
  });
});
describe('Hashstore getters', () => {
  const secret = 'MYSECRET';
  const dateStart = new DateTag(2019, 5, 15);
  const dateEnd = new DateTag(2019, 5, 20);
  const dateRangePaths = fromYears(dateStart, dateEnd);
  const hashList: IHashItem[] = dateRangePaths.map(p => {
    return {
      hash: hashFromBinStr(secret, p),
      prefix: p,
    };
  });
  const store = new HashStore(hashList);

  it('should return hashlist ', () => {
    expect(store.getHashList()).toStrictEqual(hashList);
  });
  // TODO Add tests for different date ranges, e.g. min=201906XX
  it('should return the min date of the hash store', () => {
    const resMin = store.getMinDate();
    const resMax = store.getMaxDate();
    expect(resMin).toStrictEqual(dateStart);
    expect(resMax).toStrictEqual(dateEnd);
  });
  it('should return hash for a valid Datetag', () => {
    const dateSearch = new DateTag(2019, 5, 18);
    const res = store.getHashPrefixFromDateTag(dateSearch);
    expect(res.prefix).toStrictEqual('000111111000110101100XX');
  });
  it('should throw Error if requested Date is before min Date in store', () => {
    const dateSearch = new DateTag(2018, 5, 18);
    expect(() => {
      store.getHashPrefixFromDateTag(dateSearch);
    }).toThrowError(Error('DateTag is not in range of this store'));
  });
  it('should throw Error if requested Date is after max Date in store', () => {
    const dateSearch = new DateTag(2019, 12, 18);
    expect(() => {
      store.getHashPrefixFromDateTag(dateSearch);
    }).toThrowError(Error('DateTag is not in range of this store'));
  });
  it('should calculate key for a datetag within store', () => {
    const dateSearch = new DateTag(2019, 5, 16);
    const key = store.getKeyFromDatetag(dateSearch);
    const truth = hashFromDatetag(secret, dateSearch);
    // expect(key).toStrictEqual(
    //   'JPKRMRYIEGUNOKUQ9MD9MBABRDJLZHDWZVOE9USWSYDATZYZIGYXJRLKBLFQLAIGSZANXDGASXWCDTKZX'
    // );
    expect(key).toStrictEqual(truth);
  });
});
