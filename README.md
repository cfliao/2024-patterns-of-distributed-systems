# Code for Patterns of Distributed Systems 

This repository contains code used to explore and understand the patterns presented in the book 'Patterns of Distributed Systems' (Unmesh Joshi, 2024).

## Patterns

### Write-Ahead Log (WAL)

#### Points to observe
* 主要是用來確保原本存在記憶體中的資料在程式重開後，可以根據log來重新計算出crash前的state
* All commands (i.e., create, update, and delete; currently, only update is implemented) are sequentially stored in an append-only log file.
* Each command entry in the log is sequentially executed from the first to the last whenever the program restarts (see KVStore.js).
* Supports transaction semantics, meaning it can process a list of commands that either all succeed or all fail together.

#### Implementation consideration
* Modifications are logged before they are actually applied, hence the term 'Write-Ahead.
* The choice of serialization format can present a design challenge.
* To uphold transaction semantics, an entire batch of commands must be written as a single entry in the log.

### Segmented Log
* 類似log rotate，超過一定的大小就更換為寫入另一個新檔
* 書中第79頁的程式碼中有一個openSegment沒有解釋得很清楚，它的意思是當startIndex較新，沒有用到其它的segment log，而是只需要目前正在開啟的log，此時也要將這個segment加入segments中
* 實作的重點在於檔案的命名，在書中建議的格式是prefix-logSequenceNumber-suffix; logSequenceNumber的數值為該log中第一筆record的index
* 實作上，給定一個startIndex，以此決定要讀取那幾個log files，將這些log files中的records逐一匯入; 這個startIndex(可能)是Low-Water Mark

### Low-Water Mark
* 主要的想法是另外有一個獨立的thread/process在背景依據一定規則清理log; 清理的邊界就叫做Low-Water Mark
* 比較: Low-Water Mark用來標記資料清理的邊界; High-Water Mark用來標記資料成功replicated的邊界
* Low-Water Mark一般有二種定義: snapshot based和time based; time-based是時間到就無條件清除; snapshot則是將state匯整到做snapshot當時，然後再清掉之前的。書中提到Kafka是time-based，會清掉七周前的log; ZooKeeper和Raft是snapshot-based
* Snapshop實作的方法書中沒有提到

### Leader and Followers (LaF)
* LaF是一種data replication的協調架構，在這種架構中，所有Command(Create, Update, Delete)統一先由Leader處理(配合WAL)，之後再replicate到Followers; Query部份，可以直接存取Followers
* LaF最主要的關鍵在於Leader Election: Zab和Raft可以去中心化地選出leader，Consistent Core可以(較)中心化地選出leader; 前者適合小cluster; 後者適合大cluster; 例如ZooKeeper系統整體來看，本身是一個Consistent Core，可用來支援大型Cluster的Leader Election;但ZooKeeper Server間則是採用Zab (因為是小Cluster)