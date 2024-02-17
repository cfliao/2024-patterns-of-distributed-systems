# Code for Patterns of Distributed Systems 

This repository contains code used to explore and understand the patterns presented in the book 'Patterns of Distributed Systems' (Unmesh Joshi, 2024).

## Patterns

### Write-Ahead Log

## Points to observe
* persist every command (i.e., create, update, and delete; currently only update is implemented) to an append-only log file.
* each entry(command) stored in the log is executed from the first to the last whenever the program restart (KVStore.js)
* support transaction semantics (a list of commands, which either success or fail together)

## Implementation consideration
* write to log before real modification (therefore called Write-Ahead)
* serialization format can be a design issue
* to support transaction semantics, one must write entire batch of commands in a single entry in the log
