define(["require", "exports"], function (require, exports) {
    "use strict";
    class Utils {
        /**
         * Generates random number between fromValue and toValue [inclusive]
         */
        static random(fromValue, toValue) {
            return Math.floor((Math.random() * toValue) + fromValue);
        }
        static getRandomArrayElement(valueArray) {
            var arrayLen = valueArray.length;
            var rnd = Utils.random(0, arrayLen - 1);
            return valueArray[rnd];
        }
        static getRandomDictionaryBucketKey(db) {
            var keys = db.keys();
            if (keys.length == 0) {
                throw "getRandomDictionaryBucketKey : input array is empty";
            }
            return Utils.getRandomArrayElement(keys);
        }
    }
    exports.Utils = Utils;
});
