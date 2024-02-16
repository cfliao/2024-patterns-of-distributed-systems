import KVStore from './KVStore.js';

let kv = new KVStore('wal1.log');

console.log(kv.getMap());