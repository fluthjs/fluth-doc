# Introduction

## Basics

`fluth` is a promise-like stream programming library, well-suited for reactive programming.

If you think of a `promise` as a publisher and the `then` method as a subscriber, a `promise` only publishes once.

`fluth` enhances `promise`, allowing it to publish repeatedly!

```javascript
import { $ } from 'fluth'

const promise$ = $()

promise$.then(
  (r) => console.log('resolve', r),
  (e) => console.log('reject', e)
)

promise$.next(1)
promise$.next(Promise.reject(2))
promise$.next(3)

// Logs:
// resolve 1
// resolve 3
// reject 2
```

- Compared to other stream programming libraries, `fluth` is simpler and easier to use, with a lower learning curve.
- Compared to `promise`, `fluth` can publish repeatedly and supports unsubscription.
- Compared to `promise`, `fluth` executes `then` synchronously and updates data in real time.

## Comparison with rxjs

[`rxjs`](https://rxjs.dev/) is a mainstream stream programming library. Compared to `fluth`, there are several differences:

1. `fluth` is very easy to get started with, based on `promise`, so if you know `promise`, you can use `fluth`.
2. `fluth` allows chaining of observers, while `rxjs` observers are parallel.
3. `fluth` can add plugins to extend stream functionality and add custom behaviors.

```javascript
// rxjs:
stream$.pipe(operator1, operator2, operator3)
stream$.subscribe(observer1)
stream$.subscribe(observer2)
stream$.subscribe(observer3)
```

<!-- prettier-ignore-start -->
```javascript
// fluth:
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
