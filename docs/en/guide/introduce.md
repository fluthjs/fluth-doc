# Introduction

## Basic

`fluth` is a Promise-like streaming programming library that excels at reactive programming.

If we consider `promise` as a publisher and the `then` method as a subscriber, a `promise` can only publish once.

`fluth` enhances `promise` by allowing it to publish continuously!

```javascript
import { $ } from "fluth";

const promise$ = $();

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

- Compared to other streaming programming libraries, `fluth` is simpler and easier to use, with low learning costs.
- Compared to `promise`, `fluth` can publish continuously and supports subscription cancellation.

## Comparison with rxjs

[`rxjs`](https://rxjs.dev/) is the current mainstream streaming programming library. Compared with `fluth`, there are several differences:

1. `fluth` is very easy to get started with - if you know how to use `promise`, you can use it
2. `fluth` can chain observers, while `rxjs` observers are concurrent
3. `fluth` divides stream operations into `operator` and `chainPlugin`. `chainPlugin` only handles stream composition and can be called in a chain between observers

```javascript
// rxjs:
stream$.pipe(operator1, operator2, operator3);
stream$.subscribe(observer1);
stream$.subscribe(observer2);
stream$.subscribe(observer3);
```

<!-- prettier-ignore-start -->
```javascript
//fluth:
stream$.use(chainPlugin1, chainPlugin2, chainPlugin3)

stream$
  .then(observer1)
  .chainPlugin1()
  .then(observer2)
  .chainPlugin2()
  .then(observer3)
  .chainPlugin3();
stream$.next(1);

operator1(stream$1, stream$2);
operator2(stream$2, stream$3);
```
<!-- prettier-ignore-end -->
