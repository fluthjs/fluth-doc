# Quick Start

## Installation

```bash
pnpm i fluth
```

## Usage

```typescript
import { $, fork, finish, combine, concat, merge, partition, promiseRace } from "fluth";

const promise1$ = $<string>();
const promise2$ = $<number>();

const observable1$ = promise1$.then((data) => data + "1");
const observable2$ = promise2$.then((data) => data + 1);

promise1$.next("1");
promise2$.next(1);

const forkPromise$ = fork(promise1$);

const finishPromise$ = finish(promise1$, promise2$);

const combinePromise$ = combine(promise1$, promise2$);

const concatPromise$ = concat(promise1$, promise2$);

const mergePromise$ = merge(promise1$, promise2$);

const [selection$, unSelection$] = partition(promise1$, (data) => data % 2 === 1);

const racePromise$ = promiseRace(promise1$, promise2$);
```
