export module Dictionaries {
    export class DictionaryBucket {
        private _keys : Array<string>;
        private _values : Array<any>;

        constructor() {
            this._keys = new Array<string>();
            this._values = new Array<any>();
        }

        add(key : string, value : any) {
            if (!this.containsKey(key)) {
                let valueArray = new Array<any>();
                valueArray.push(value);
                this[key] = valueArray;
                this._keys.push(key);
                this._values.push(valueArray);
            } else {
                let valueArray = this[key];
                valueArray.push(value);
            }
        }

        remove(key : string) {
            var index = this._keys.indexOf(key);
            this._keys.splice(index, 1);
            this._values.splice(index, 1);
            delete this[key];
        }

        get(key : string) : Array<any> {
            var index = this._keys.indexOf(key);
            if (index !== -1) {
                return this._values[index];
            }
            return null;
        }

        getFirstBucketValue(key : string) : any {
            var index = this._keys.indexOf(key);
            if (index !== -1) {
                return this._values[index][0];
            }
            return null;
        }

        /**
         * Get first value in bucket defined by key and then removes it from bucket
         */
        pick(key : string) : any {
            if (!this.containsKey(key)) {
                return null;
            }

            var index = this._keys.indexOf(key);
            var valueArray : Array<any> = this._values[index];
            var deleted : any[] = valueArray.splice(0, 1);

            if (valueArray.length === 0) {
                this.remove(key);
            } 

            return deleted[0];
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

        clear() {
            for (var key of this._keys) {
                delete this[key];
            }

            this._keys = [];
            this._values = [];
        }
    }

    export class DictionaryBucketIterator {
        private db : DictionaryBucket;
        private dbKeys : Array<string>;
        private currentKey : string;
        private currentKeyPos :  number;
        private currentValueArray : Array<any>;
        private currentValuePos : number;

        constructor(db : DictionaryBucket) {
            this.db = db;
            this.dbKeys = db.keys();
            this.currentKey = (this.dbKeys.length === 0) ? null : this.dbKeys[0];
            this.currentKeyPos = 0;    
            this.currentValueArray = (this.dbKeys.length === 0) ? null : db.get(this.currentKey);
            this.currentValuePos = -1;
        }

        hasNext() : boolean {
            if (this.currentKey === null) {
                return false;
            }
            if (this.currentKeyPos === this.dbKeys.length - 1 && this.currentValuePos === this.currentValueArray.length - 1) {
                return false;
            }
            return true;
        }

        next() : any {
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
            this.currentKey = null;
            return null;
        }

        removeCurrent() : any {
            var removedArr = this.currentValueArray.splice(this.currentValuePos, 1);
            if (this.currentValueArray.length === 0) {
                this.db.remove(this.currentKey);
                if (this.dbKeys.length === 0) {
                    this.currentKey = null;
                } else {
                    this.currentKey = this.dbKeys[this.currentKeyPos];
                    this.currentValueArray = this.db.get(this.currentKey);
                    this.currentValuePos = -1;
                }        
            } else if (this.currentValuePos > this.currentValueArray.length - 1) {
                if (this.currentKeyPos < this.dbKeys.length - 1) {
                    this.currentKeyPos++;
                    this.currentKey = this.dbKeys[this.currentKeyPos];
                    this.currentValueArray = this.db.get(this.currentKey);
                    this.currentValuePos = -1;
                } else {
                    this.currentKey = null;
                }   
            }

            return removedArr[0];
        }

        private moveToNextKey() {
            this.currentKeyPos++;
            this.currentKey = this.dbKeys[this.currentKeyPos];
            this.currentValueArray = this.db.get(this.currentKey);
            this.currentValuePos = -1;
        }

        getCurrentKey() : string {
            return this.currentKey;
        }
    }

}    