define(["require", "exports"], function (require, exports) {
    "use strict";
    var Dictionaries;
    (function (Dictionaries) {
        class DictionaryBucket {
            constructor() {
                this._keys = new Array();
                this._values = new Array();
            }
            add(key, value) {
                if (!this.containsKey(key)) {
                    let valueArray = new Array();
                    valueArray.push(value);
                    this[key] = valueArray;
                    this._keys.push(key);
                    this._values.push(valueArray);
                }
                else {
                    let valueArray = this[key];
                    valueArray.push(value);
                }
            }
            remove(key) {
                var index = this._keys.indexOf(key);
                this._keys.splice(index, 1);
                this._values.splice(index, 1);
                delete this[key];
            }
            get(key) {
                var index = this._keys.indexOf(key);
                if (index !== -1) {
                    return this._values[index];
                }
                return null;
            }
            getFirstBucketValue(key) {
                var index = this._keys.indexOf(key);
                if (index !== -1) {
                    return this._values[index][0];
                }
                return null;
            }
            /**
             * Get first value in bucket defined by key and then removes it from bucket
             */
            pick(key) {
                if (!this.containsKey(key)) {
                    return null;
                }
                var index = this._keys.indexOf(key);
                var valueArray = this._values[index];
                var deleted = valueArray.splice(0, 1);
                if (valueArray.length === 0) {
                    this.remove(key);
                }
                return deleted[0];
            }
            containsKey(key) {
                if (typeof this[key] === "undefined") {
                    return false;
                }
                return true;
            }
            keys() {
                return this._keys;
            }
            values() {
                return this._values;
            }
            clear() {
                for (var key of this._keys) {
                    delete this[key];
                }
                this._keys = [];
                this._values = [];
            }
        }
        Dictionaries.DictionaryBucket = DictionaryBucket;
        class DictionaryBucketIterator {
            constructor(db) {
                this.db = db;
                this.dbKeys = db.keys();
                this.currentKey = (this.dbKeys.length === 0) ? null : this.dbKeys[0];
                this.currentKeyPos = 0;
                this.currentValueArray = (this.dbKeys.length === 0) ? null : db.get(this.currentKey);
                this.currentValuePos = 0;
            }
            hasNext() {
                if (this.currentKey === null) {
                    return false;
                }
                if (this.currentKeyPos === this.dbKeys.length - 1 && this.currentValuePos === this.currentValueArray.length - 1) {
                    return false;
                }
                return true;
            }
            next() {
                // move within bucket
                if (this.currentValuePos < this.currentValueArray.length - 1) {
                    this.currentValuePos++;
                    return this.currentValueArray[this.currentValuePos];
                }
                // move to next key
                if (this.currentKeyPos < this.dbKeys.length - 1) {
                    this.currentKeyPos++;
                    this.currentKey = this.dbKeys[this.currentKeyPos];
                    this.currentValueArray = this.db.get(this.currentKey);
                    this.currentValuePos = 0;
                    return this.currentValueArray[this.currentValuePos];
                }
                // cannot move forward
                return null;
            }
            removeCurrent() {
                var removedArr = this.currentValueArray.splice(this.currentValuePos, 1);
                if (this.currentValuePos > this.currentValueArray.length - 1) {
                    if (this.currentKeyPos < this.dbKeys.length - 1) {
                        this.currentKeyPos++;
                        this.currentKey = this.dbKeys[this.currentKeyPos];
                        this.currentValueArray = this.db.get(this.currentKey);
                        this.currentValuePos = 0;
                    }
                }
                return removedArr[0];
            }
            getCurrentKey() {
                return this.currentKey;
            }
        }
        Dictionaries.DictionaryBucketIterator = DictionaryBucketIterator;
    })(Dictionaries = exports.Dictionaries || (exports.Dictionaries = {}));
});
