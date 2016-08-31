export module Dictionaries {
    export class Dictionary {
        private _keys : Array<string>;
        private _values : Array<any>;

        constructor() {
            this._keys = new Array<string>();
            this._values = new Array<any>();
        }

        add(key : string, value : any) {
            this[key] = value;
            this._keys.push(key);
            this._values.push(value);
        }

        remove(key : string) {
            var index = this._keys.indexOf(key);
            this._keys.splice(index, 1);
            this._values.splice(index, 1);
            delete this[key];
        }

        get(key : string) : any {
            var index = this._keys.indexOf(key);
            if (index !== -1) {
                return this._values[index];
            }
            return null;
        }

        containsKey(key : string) : boolean {
            if (typeof this[key] === "undefined") {
                return false;
            }
            return true;
        }

        keys() : string[] {
            return this._keys;
        }

        values() : any[] {
            return this._values;
        }
    }

    export class DictionaryIterator {
        private db : Dictionary;
        private dbKeys : Array<string>;
        private currentKey : string;
        private currentKeyPos :  number;

        constructor(db : Dictionary) {
            this.db = db;
            this.dbKeys = db.keys();
            this.currentKey = (this.dbKeys.length === 0) ? null : this.dbKeys[0];
            this.currentKeyPos = 0;    
        }

        hasNext() : boolean {
            if (this.currentKey === null) {
                return false;
            }
            if (this.currentKeyPos === this.dbKeys.length - 1) {
                return false;
            }
            return true;
        }

        next() : any {
            // move to next key
            if (this.currentKeyPos < this.dbKeys.length - 1) {
                this.currentKeyPos++;
                this.currentKey = this.dbKeys[this.currentKeyPos];
                return this.db.get(this.currentKey);
            }

            // cannot move forward
            return null;
        }

        getCurrentKey() : string {
            return this.currentKey;
        }
    }
}    