# Basic Concepts

## Stream

In fluth, there are two types of streams: [Stream](/en/api/stream) and [Observable](/en/api/observable). A stream is a subscribable data source. After subscribing to a Stream, the resulting [subscription node](#subscription-node) is an Observable stream.

The main difference between Stream and Observable is that a Stream can actively push data, while an Observable can only passively receive pushed data or repeat the last push.

```typescript
import { $ } from 'fluth'

const promise$ = $()

const observable$ = promise$.then(xxx)

const observable1$ = observable$.then(xxx)

promise$.next(xxx) // Push data
```

## Push

Pushing means sending new data sources to subscription nodes. There are active and passive pushes: active push means a node can actively send data, while passive push means a node can only passively receive processed data and then push it to its subscription nodes.

- [Stream](/en/api/stream) can use the next method for active push; all subscription nodes will receive the pushed data.

```typescript
import { Stream } from 'fluth'

const promise$ = new Stream()

promise$.then((data) => console.log(data))

promise$.next('hello') // Output: hello
```

- You can also use the set method to push data, which differs from next in that set pushes an immutable data object based on the previous data.

```typescript
import { $ } from 'fluth'
const promise$ = $({ a: 1, b: { c: 2 } })
const oldValue = promise$.value

promise$.set((state) => (state.a = 3))
const newValue = promise$.value

console.log(oldValue === newValue) // false
console.log(oldValue.b === newValue.b) // true
```

## Execute

Calling the [execute](/en/api/observable#execute) method of an [observable](/en/api/observable) subscription node re-executes the last data flow and pushes it to all its child subscription nodes.

## Subscription Node

fluth uses a promise-like approach to push data flow. By calling methods like [then](/en/api/observable#then), [thenOnce](/en/api/observable#thenonce), [thenImmediate](/en/api/observable#thenimmediate), you add a subscription node and return an [Observable](/en/api/observable) instance. Overall usage is consistent with promise.

## Chained Subscription

Calling the [then](/en/api/observable#then) method of a [observable](/en/api/observable) allows for chained subscriptions, similar to the then chaining in promise.

## Partial Subscription

Use the [get](/en/api/operator/get) operator for partial subscription, subscribing only to changes in the part of the data returned by get.

## Conditional Subscription

Only nodes that meet the condition will push data. The [change](/en/api/operator/change) and [filter](/en/api/operator/filter) operators allow for conditional subscription. The difference between the two is:

- change takes a getter function, passing in the previous and current data, and only pushes if the value changes.
- filter takes a condition function, passing in the current data, and only pushes if it returns true.

## Unsubscribe

Call the [unsubscribe](/en/api/observable#unsubscribe) method of a subscription node to unsubscribe.

- Unsubscribing a node will trigger unsubscription for all its child nodes.
- Unsubscribing a node will first trigger the node's [afterComplete](/en/api/observable#aftercomplete) callback, then trigger the node's [afterUnsubscribe](/en/api/observable#afterunsubscribe) callback.

## Complete

Only [Stream](/en/api/stream) can be completed. After a stream is completed:

- The stream will no longer push data
- The stream will not accept new subscription nodes
- Unsubscribe all downstream subscription nodes

There are two ways to complete a stream:

```typescript
import { Stream } from 'fluth'

const promise$ = new Stream()

// Complete method 1: pass true to next to indicate completion, last push
promise$.next(1, true)

// Complete method 2: call complete method to end the stream
promise$.complete() // End the stream
```

After a stream node is completed, each subscription node will trigger [afterComplete](/en/api/observable#aftercomplete) after the last data push, then automatically unsubscribe all its subscribers, and trigger [afterUnsubscribe](/en/api/observable#afterunsubscribe) for all child nodes.
