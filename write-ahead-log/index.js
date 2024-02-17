import KVStore from './KVStore.js';

//const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, '').replace(/(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1$2$3$4$5$6');
//let kv = new KVStore(`wal-${timestamp}.log`);
let kv = new KVStore('wal.log');
kv.put('name', 'John');
kv.put('age', 25);

// let batch = new Map();
// batch.set('name', 'New York');
// batch.set('age', 33);
// kv.putBatch(batch);

console.log(kv.getMap());
