# Boundary

fluth offers a promise-like experience. However, a promise publishes data only once, while a fluth stream can publish multiple times, so boundary cases are more complex. Below are several important boundaries to understand.

## Synchrony and Asynchrony

fluth streams are synchronous, while promise is asynchronous.

```typescript
import { $ } from 'fluth'
const promise$ = $()

promise$.then((value) => {
  console.log(value)
})

promise$.next(1)
promise$.next(2)
promise$.next(3)
console.log('start')

// Output
// 1
// 2
// 3
// start
```

```typescript
Promise.resolve(1).then((value) => {
  console.log(value)
})

console.log('start')

// Output
// start
// 1
```

Only when fluth pushes asynchronous data does the stream become asynchronous:

```typescript
import { $ } from 'fluth'
const promise$ = $()

promise$.then((value) => {
  console.log(value)
})

promise$.next(Promise.resolve(1))
promise$.next(Promise.resolve(2))
promise$.next(Promise.resolve(3))
console.log('start')

// Output
// start
// 1
// 2
// 3
```

Design rationale: fluth mainly targets reactive programming in frontend logic. If every node were asynchronous, it would trigger frequent re-renders.

## Async Race

Because fluth supports chained subscriptions and subscription nodes may be asynchronous, their completion time is uncertain.

If an asynchronous node has not finished yet and the stream pushes new data, the previous async result will neither be set as the node value nor passed downstream. The new data will start a new async operation instead.

<div style="display: flex; justify-content: center">
  <img src="/raceCase.drawio.svg" alt="image" >
</div>

## Error Handling

If a node throws an error during execution, the error will be passed to the next subscription node that defines an onRejected handler, just like promise. For intermediate nodes without an onRejected handler, fluth skips them but sets the node status to rejected.

<div style="display: flex; justify-content: center">
  <img src="/errorCase.drawio.svg" alt="image" >
</div>

## Unsubscribe

- When a node is [unsubscribed](/en/guide/base.html#unsubscribe) while it is pending, its downstream will not be triggered after it finishes.
- When a node is [unsubscribed](/en/guide/base.html#unsubscribe), all of its child nodes are also unsubscribed. If child nodes are pending at that time, then after they finish:
  - Their downstream nodes will not be triggered
  - When all pending child nodes finish, the parent node is cleaned up to prevent memory leaks
