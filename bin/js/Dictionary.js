define(["require", "exports"], function (require, exports) {
    "use strict";
    var Dictionaries;
    (function (Dictionaries) {
        class Dictionary {
            constructor() {
                this._keys = new Array();
                this._values = new Array();
            }
            add(key, value) {
                this[key] = value;
                this._keys.push(key);
                this._values.push(value);
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
        }
        Dictionaries.Dictionary = Dictionary;
        class DictionaryIterator {
            constructor(db) {
                this.db = db;
                this.dbKeys = db.keys();
                this.currentKey = (this.dbKeys.length === 0) ? null : this.dbKeys[0];
                this.currentKeyPos = 0;
            }
            hasNext() {
                if (this.currentKey === null) {
                    return false;
                }
                if (this.currentKeyPos === this.dbKeys.length - 1) {
                    return false;
                }
                return true;
            }
            next() {
                // move to next key
                if (this.currentKeyPos < this.dbKeys.length - 1) {
                    this.currentKeyPos++;
                    this.currentKey = this.dbKeys[this.currentKeyPos];
                    return this.db.get(this.currentKey);
                }
                // cannot move forward
                return null;
            }
            getCurrentKey() {
                return this.currentKey;
            }
        }
        Dictionaries.DictionaryIterator = DictionaryIterator;
    })(Dictionaries = exports.Dictionaries || (exports.Dictionaries = {}));
});
