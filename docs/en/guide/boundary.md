# Boundary Explanation

fluth implements a promise-like experience from the ground up, but while promise pushes data only once, fluth streams can push data multiple times, making fluth's boundary scenarios far more complex than promise. Below are explanations of some boundary scenarios:

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
console.log('start')

// Output
// start
// 1
```

::: tip Tip
If you call `promise$.next(Promise.resolve(...))` multiple times synchronously in a row, fluth's default overwrite race mechanism will supersede the earlier unresolved pushes and silently discard them—only the last push takes effect. See [Race Conditions with Async](#race-conditions-with-async) below.
:::

Design rationale: fluth's main use case is reactive programming in frontend logic. If every data processing node were asynchronous, it would trigger frequent page re-renders.

## Race Conditions with Async

Because fluth supports chained subscriptions and subscription nodes may be asynchronous, the completion time of asynchronous nodes is non-deterministic.

When an asynchronous node has not finished executing and the upstream stream pushes new data, the result of the older in-flight asynchronous operation will neither be stored as the node's value nor propagated to downstream nodes. Instead, the pipeline restarts with the new data.

As shown in the diagram, when the stream pushes new data, the data returned by the original asynchronous node is directly discarded, and the new data is used to restart the asynchronous operation:

<div style="display: flex; justify-content: center">
  <img src="/raceCase.drawio.svg" alt="image" >
</div>

### Mechanism: `_rootPromise` Overwrite Race Semantics

Internally, the root `Stream` maintains a `_rootPromise` reference that identifies the latest push:

1. **Every `next()` refreshes the root identifier**: Whenever `stream$.next(payload)` (or `stream$.set()`, which delegates to `next()`) is called, fluth normalizes the payload into a Promise (`payload` itself if it is `PromiseLike`, otherwise `Promise.resolve(payload)`) and overwrites the root stream's `_rootPromise` (passing the exact same Promise reference twice is ignored).
2. **Every node checks the root identifier**: As data propagates through downstream `Observable` nodes, each node carries the `rootPromise` of that push. Before executing a node, and whenever an async callback's Promise settles (`fulfilled` or `rejected`) before updating state or continuing downstream, fluth checks `rootPromise === this._root?._rootPromise`.
3. **Stale in-flight async callbacks are silently discarded**: If upstream emits a new value before an earlier async task finishes, `_rootPromise` has already changed. When the older Promise eventually resolves or rejects, its result is **silently discarded**—it will not update the node's `value` or `status`, will not trigger `afterSetValue` callbacks, and will not propagate to downstream `then` / `catch` nodes.

This provides built-in **`switchMap`-like overwrite race semantics** ("last push wins"):

```typescript
import { $ } from 'fluth'

const search$ = $<string>()

search$
  .then((keyword) => {
    const delay = keyword === 'a' ? 300 : 100
    return new Promise<string>((resolve) => {
      setTimeout(() => resolve(`result:${keyword}`), delay)
    })
  })
  .then((result) => {
    console.log('Render result:', result)
  })

search$.next('a') // Refreshes _rootPromise (takes 300ms)
search$.next('ab') // Refreshes _rootPromise again (takes 100ms); 'a' will be silently discarded

// After 100ms, outputs: Render result: result:ab
// After 300ms, 'a' resolves, but since _rootPromise changed, it is silently discarded
```

Similarly, pushing multiple Promises synchronously without awaiting them only lets the last one pass:

```typescript
import { $ } from 'fluth'

const stream$ = $<number>()
stream$.then((value) => console.log(value))

stream$.next(Promise.resolve(1))
stream$.next(Promise.resolve(2))
stream$.next(Promise.resolve(3))

// Only outputs: 3 (1 and 2 are silently discarded because _rootPromise was overwritten before their microtasks ran)
```

::: warning Note: fluth does not automatically abort underlying requests
The `_rootPromise` check only discards stale results at fluth's stream propagation layer; it does not automatically cancel already-dispatched network calls such as `fetch`. If you need to save bandwidth or prevent stale write requests from reaching the server, pair it with `AbortController` to abort the previous request.
:::

### Suitable Scenarios

Overwrite race discarding is well suited for **query, rendering, and interactive orchestration** scenarios where only the result of the latest input matters:

- **Debounced search requests**: As users type continuously, combine `debounce` with an async search request. Even if an earlier request returns more slowly than a newer one, it is automatically discarded so stale results never overwrite the latest UI.
- **Form linkage & cascading queries**: Switching filters, cascading selects (e.g., region dropdowns), or tabs triggers async fetches for options or lists—only the latest selection is rendered.
- **Async form validation**: Real-time remote validation while typing (e.g., checking username availability) only cares about the latest input, eliminating manual `requestId` tracking or race guards.

### Unsuitable Scenarios and Caveats

::: danger Warning: Do not rely on default async discarding for lossless workflows
Whenever your use case **cannot drop any message** or requires **every async operation to run to completion downstream**, do not directly return a Promise in a fluth async chain.
:::

Common unsuitable scenarios include:

- **Continuous WebSocket / SSE message streams**: When multiple messages arrive in rapid succession and downstream `then` handlers perform async work (async parsing, writing to IndexedDB, enriching via API), each new message's `next()` refreshes `_rootPromise` and silently discards earlier in-flight async callbacks.
- **Queued write operations & ordered mutations**: Sequential database/API writes triggered by rapid user actions, ordered multi-step submissions, or offline sync queues where a newer push would drop an unfinished write's downstream handling.
- **Analytics tracking & log reporting**: High-frequency events triggering async reporting requests—returning the reporting Promise in the stream chain causes later events to supersede and discard unfinished reporting callbacks.

#### Recommended Approaches

If you still want to use fluth in these scenarios, avoid relying on its overwrite race semantics:

1. **Consume synchronously without returning a Promise**: For independent fire-and-forget side effects (such as analytics reporting), trigger the async call inside `then` and handle errors locally **without returning the Promise**. The node completes synchronously and is not affected by `_rootPromise` discarding.

```typescript
track$.then((event) => {
  // Do not return the Promise so it runs outside _rootPromise race discarding
  void sendAnalytics(event).catch((err) => console.error('Report failed:', err))
})
```

2. **Use an explicit sequential queue**: For WebSocket messages or ordered writes, enqueue each message onto an external Promise chain or task queue inside a synchronous `then` handler:

```typescript
let queue = Promise.resolve()

wsMessage$.then((msg) => {
  queue = queue
    .then(() => persistMessage(msg))
    .catch((err) => console.error('Failed to process message:', err))
})
```

3. **Batch events with `buffer` before async processing**: For high-frequency events or telemetry, collect them synchronously with the [`buffer`](/en/api/operator/buffer) operator and send them in batches.
4. **Choose a concurrency primitive that fits**: If lossless message queuing or diverse concurrency strategies (`concatMap`, `mergeMap`, `exhaustMap`) are core requirements, use a dedicated task queue or a library such as RxJS.

## Error Handling

If a node throws an error during execution, this error will be passed to the next subscription node that defines an onRejected handler, consistent with promise error handling.

For intermediate nodes that don't define onRejected handling, fluth will skip them directly but set the subscription node's status to `rejected`.

<div style="display: flex; justify-content: center">
  <img src="/errorCase.drawio.svg" alt="image" >
</div>

## Unsubscribe

- When a node is [unsubscribed](/en/guide/base.html#unsubscribe) while it is in pending state, downstream nodes will not be triggered after the node completes execution.
- When a node is [unsubscribed](/en/guide/base.html#unsubscribe), all of its child nodes are also unsubscribed. If child nodes are in pending state at that time, after the child nodes complete execution:
  - Downstream nodes of the child nodes will not be triggered
  - When all child nodes finish their pending state, the parent node will be cleaned up to prevent memory leaks.
