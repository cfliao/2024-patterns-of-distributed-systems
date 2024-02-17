# Code for Patterns of Distributed Systems 

This repository contains code used to explore and understand the patterns presented in the book 'Patterns of Distributed Systems' (Unmesh Joshi, 2024).

## Patterns

### Write-Ahead Log

#### Points to observe
* All commands (i.e., create, update, and delete; currently, only update is implemented) are sequentially stored in an append-only log file.
* Each command entry in the log is sequentially executed from the first to the last whenever the program restarts (see KVStore.js).
* Supports transaction semantics, meaning it can process a list of commands that either all succeed or all fail together.

#### Implementation consideration
* Modifications are logged before they are actually applied, hence the term 'Write-Ahead.
* The choice of serialization format can present a design challenge.
* To uphold transaction semantics, an entire batch of commands must be written as a single entry in the log.

