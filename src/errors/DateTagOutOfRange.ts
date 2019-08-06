export default class DateTagOutOfRange extends Error {
    constructor(m: string) {
        super(m)
    }
}