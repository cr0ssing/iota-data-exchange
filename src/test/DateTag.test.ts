import DateTag from "../date";

describe("DateTag", () => {
    const year = 2019
    const month = 6
    const day = 15

    it("generate a new Object", () => {
        const dateTag = new DateTag(year, month, day)

        expect(dateTag.year).toBe(year)
        expect(dateTag.month).toBe(month)
        expect(dateTag.day).toBe(day)
        expect(dateTag.hour).toBe(null)
        expect(dateTag.minute).toBe(null)
        expect(dateTag.second).toBe(null)

    }),
    it("get Path to Date", () => {
        const dateTag = new DateTag(year, month, day)
        const path = dateTag.getPath()
        expect(path).toBe(
            year.toString(2) + month.toString(2) + day.toString(2)
            )
    }),
    it("get the distance to the giveb date", () => {
        const dateTagStart = new DateTag(year, month, day)
        const dateTagEnd = new DateTag(year, month + 2, day + 3)

    })
})