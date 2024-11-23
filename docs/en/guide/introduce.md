# Introduction

## Basic Concepts

`fluth` is a Promise-based streaming programming library that excels at orchestrating asynchronous workflows.

If we consider `promise` as a publisher and the `then` method as a subscriber, a `promise` can only publish once.

`fluth` enhances `promise` by allowing it to publish continuously!

```javascript
import { Stream } from "fluth";

const promise$ = new Stream();

promise$.then(
  (r) => console.log("resolve", r),
  (e) => console.log("reject", e)
);

promise$.next(1);
promise$.next(Promise.reject(2));
promise$.next(3);

// Logs:
// resolve 1
// reject 2
// resolve 3
```

Compared to other streaming programming libraries, fluth focuses more on handling asynchronous workflow scenarios. With `fluth`, you can easily organize asynchronous logic in a streaming way, making code semantics and timing more clear.

## Applicable Scenarios

`fluth` was created to solve reactive asynchronous programming problems.

In reactive programming, asynchronous operations often modify reactive data, and business code handles asynchronous logic by listening to data changes. However, organizing code by listening to data changes brings two problems: 1. Difficult to read, 2. Timing chaos.

Listening to data lacks semantics and loses context, making code difficult to read. Even simple business code becomes increasingly costly to maintain. The timing of asynchronous workflows in complex business logic is also very complex, and controlling timing becomes difficult when listening to data changes.

`promise` can actually solve these two problems well. Putting each step of processing in `then` means there is a line connecting all the logic together. Any node can be semantically named, making it very easy to read code and organize logic. Since each piece of logic is processed serially from top to bottom, another benefit is simple timing management.

However, `promise` can only execute once and cannot be stopped midway. `fluth` solves these problems of `promise`. You can think of `fluth` as a `promise` stream that can continuously publish data. Any `then` node in the middle can subscribe to upstream data and can also unsubscribe.

After adopting `fluth`, the original web-like reactive logic becomes traceable streaming logic:

![image](/structure.drawio.png)

## Comparison with rxjs

[rxjs](https://rxjs.dev/) is the current mainstream streaming programming library. Compared with `fluth`, there are two obvious differences:

1. `fluth` is very easy to get started with - if you know how to use `promise`, you can use it
2. `rxjs` has more powerful capabilities in data processing, while `fluth` focuses more on observer orchestration:
   - `rxjs` has rich `operators` to implement powerful data processing capabilities, but `observers` are concurrent
   - `fluth` is based on `promise` and is better at orchestrating `observers`

```javascript
// rxjs:
stream$.pipe(operator1).pipe(operator2).pipe(operator3);
stream$.subscribe(observer1);
stream$.subscribe(observer2);
stream$.subscribe(observer3);
```

```javascript
//fluth:
stream$.then(observer1).then(observer2).then(observer3);
stream$.next(1);
```
