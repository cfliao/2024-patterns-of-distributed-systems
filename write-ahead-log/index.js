import KVStore from './KVStore.js';

let kv = new KVStore('wal1.log');
kv.put('name', 'Alice');
kv.put('age', 12);
kv.put('name', 'Bob');
kv.put('age', 13);
console.log(kv.getMap());