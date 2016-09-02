import {Dictionaries} from "./DictionaryBucket";

export class Utils {

    /**
     * Generates random number between fromValue and toValue [inclusive]
     */
    static random(fromValue : number, toValue : number) {
        return Math.floor((Math.random()*toValue) + fromValue);
    }

    static getRandomArrayElement(valueArray : any[]) {
        var arrayLen = valueArray.length;
        var rnd = Utils.random(0, arrayLen - 1);
        return valueArray[rnd];
    }

    static getRandomDictionaryBucketKey(db : Dictionaries.DictionaryBucket) : any {
        var keys = db.keys();
        if (keys.length == 0) {
            throw "getRandomDictionaryBucketKey : input array is empty";
        }
        return Utils.getRandomArrayElement(keys);
    }
}