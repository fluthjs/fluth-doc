# Introduction

## Basics

`fluth` is a Promise-like streaming programming library, good at reactive programming.

If we consider `promise` as a publisher and the `then` method as a subscriber, then `promise`'s publishing behavior only happens once.

`fluth` enhances `promise`, allowing `promise` to publish continuously!

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
// resolve 3
// reject 2
```

- Compared to other streaming programming libraries, `fluth` is simpler and easier to use with a low learning curve
- Compared to `promise`, `fluth` can publish continuously and supports unsubscription

## Comparison with RxJS

[`rxjs`](https://rxjs.dev/) is the current mainstream streaming programming library. Compared to `fluth`, there are several differences:

1. `fluth` is very easy to get started with. It's a Promise-based streaming programming library. If you know how to use `promise`, you can use `fluth`
2. `fluth` can chain observers, while `rxjs`'s `observer`s are concurrent
3. `fluth` divides stream operations into `operator`s and `plugin`s. Plugins can be used to extend stream functionality and add custom behaviors

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
stream$.use(plugin1, plugin2, plugin3)

stream$
  .pipe(operator1, operator2)
  .then(observer1)
  .pipe(operator3)
  .then(observer2)
  .pipe(operator4)
  .then(observer3);
stream$.next(1);

```
<!-- prettier-ignore-end -->
