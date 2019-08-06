export default class NoHashPrefixFound extends Error {
  constructor(m: string) {
    super(m);
  }
}
