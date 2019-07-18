const a: number = 12
const b: number = 24

const aBin = a.toString(2)
const bBin = b.toString(2)

const aBinLong = buildStrBin(aBin, 5)
const bBinLong = buildStrBin(bBin, 5)
// console.log(aBin[0])
// console.log(bBin)
/**
 * Extends a binary string to a given length
 * @param s binary string of a number
 * @param l desired lenght of the binary string
 */
function buildStrBin (s : string, l:number) :string{
    let res = ""
    const lenght = l ? l : 4
    const diff = lenght > s.length ? lenght - s.length : 0

    for (let i = 0; i < diff; i++) {
        
            res+="0"
        
    
    }
    res +=s
    return res
}
/**
 * calculate the min number that can be represented
 * @param s binary string
 * @param o number of replaced digits at the end
 */
function getMin(s:string, o:number) :[number,string]{
    let res = ""
    const e = s.substr(0,s.length-o)
    // console.log(e)
    for (let i = 0; i <s.length; i++) {
        if (e[i]) {
            // console.log(s[i])
            res+= e[i]
        } else {
            // console.log("0")
            res+="0"
        }
    
    }
    const val = parseInt(res,2)
    // console.log(`MIN - input: ${s} short: ${e} output: ${res} val: ${val}`)
    return  [val, res]
}
/**
 * calculate the max number that can be represented
 * @param s binary string
 * @param o number of replaced digits at the end
 */
function getMax(s:string, o:number) :[number,string]{
    let res = ""
    const e = s.substr(0,s.length-o)
    for (let i = 0; i < s.length; i++) {
        if (e[i]) {
            // console.log(s[i])
            res+= e[i]
        } else {
            // console.log("0")
            res+="1"
        }
    
    }
    const val = parseInt(res,2)
    // console.log(`MAX - input: ${s} short: ${e} output: ${res} val: ${val}`)
    return [val, res]
}

/**
 * calculates the min and max range that can be represeted 
 * @param s input string of a binary value
 * @param offset number of values at the end of s that are replaced
 */
function getMinMaxRange(s:string, offset: number) :[number, number] {
    const minRes = getMin(s,offset)
    const minVal = minRes[0]
    const maxRes = getMax(s,offset)
    const maxVal = maxRes[0]
    return [minVal, maxVal]

}
/**
 * Generate a given string n-times 
 * @param n number of repetitions
 * @param val string to be repeated
 */
function appendStrVals(n:number, val:string){
    let res = ""
    for (let i=0; i<n;i++){
        res = res + val
    }
    return res
}
/**
 * Calculates all the intermediary nodes between given string and root
 * @param s binary string that is used as a string point
 * @param start start value
 * @param end end value
 */
function getChildNodes(s:string, start:number, end:number) :string[]{
    let result = []
    for (let i = 0; i < s.length - 1; i++){
        /**
         * Fallunterscheidung wenn die letzte stellen 1 oder 0 ist
         */
        const caseZero = s.substr(0, s.length - 1 - i) + appendStrVals(i+1, "0")
        const caseOne = s.substr(0, s.length - 1 - i)  + appendStrVals(i+1, "1")
        /**
         * Berechne mininmale und maximale Werterbereich der damit dargestellt werden kann
         */
        const caseZeroMinMax = getMinMaxRange(caseZero, i)
        const caseOneMinMax = getMinMaxRange(caseOne, i)

        /**
         * überprüfe ob der darzustellende Wertebereich den Start- oder Endwert überschreitet
         */
        const caseZeroValid = (start <= caseZeroMinMax[0])  && (caseZeroMinMax[1] <= end)
        const caseOneValid = (start <= caseOneMinMax[0]) && (caseOneMinMax[1] <= end)
        if(caseZeroValid && caseOneValid) {
        } else if (caseZeroValid && !caseOneValid) {
            const res = caseZero.substr(0, s.length - 1 - i) + "0" + appendStrVals(i, "X")
            result = [...result,res]
        } else if (!caseZeroValid && caseOneValid) {
            const res = caseOne.substr(0, s.length - 1 - i) + "1" + appendStrVals(i, "X")
            result = [...result,res]
        }
    }
    return result

}
/**
 * Calculcates the nodes needed for hashing
 * @param start starting leave
 * @param end ending leave
 */
function getNodesForHashing(start:number, end:number, treeMax?:number) {
    treeMax = treeMax ? treeMax : 31
    const depth = Math.ceil(Math.log2(treeMax))

    const startBin = start.toString(2)
    const endBin = end.toString(2)
    
    const startBinLong = buildStrBin(startBin, depth)
    const endBinLong = buildStrBin(endBin, depth)
    const startHashing = getChildNodes(startBinLong, start, end)
    const endHashing = getChildNodes(endBinLong, start, end)
    const allHashing =[...new Set([...startHashing,...endHashing])] 
    console.log(`-------------- \nStart: ${start} \nEnd: ${end} \nHashingVals: [${allHashing}]`)
}
getNodesForHashing(1,31)
getNodesForHashing(5,21)
getNodesForHashing(20,22)
getNodesForHashing(13,18)
getNodesForHashing(19,29)
getNodesForHashing(16,17)