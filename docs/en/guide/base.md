# Basic Concepts

## Stream

In `fluth`, there are two types of streams: [`Stream`](/en/api/stream) and [`Observable`](/en/api/observable). A stream is a data source that can be subscribed to. The [subscription node](#subscription-node) after subscribing to a `Stream` is an `Observable`.

The main difference between `Stream` and `Observable` is that `Stream` can actively push data, while `Observable` can only passively push data or repeat the last push.

```typescript
import { $ } from 'fluth'

const promise$ = $()

const observable$ = promise$.then(xxx)

const observable1$ = observable$.then(xxx)

promise$.next(xxx) // Push data
```

## Data Push

Data push is the process of pushing new data sources to subscription nodes. Data push is divided into active push and passive push. Active push means nodes can actively push data, while passive push means nodes can only passively receive data, process it, and then push the processed data to subscription nodes.

- [`Stream`](/en/api/stream) can use the `next` method for active data push, and all subscription nodes will receive the pushed data

```typescript
import { Stream } from 'fluth'

const promise$ = new Stream()

promise$.then((data) => console.log(data))

promise$.next('hello') // prints hello
```

- You can also use the `set` method to push data. The difference from the `next` method is that the `set` method pushes `immutable` data based on the previous data.

```typescript
import { $ } from 'fluth'
const promise$ = $({ a: 1, b: { c: 2 } })
const oldValue = promise$.value

promise$.set((state) => (state.a = 3))
const newValue = promise$.value

console.log(oldValue === newValue) // false
console.log(oldValue.b === newValue.b) // true
```

## Execution

Call the [execute](/en/api/observable#execute) method of the subscription node's [observable](/en/api/observable) to re-execute the last subscribed data flow and push it to all its child subscription nodes.

## Subscription Node

`fluth` uses a `promise`-like form for data flow pushing. You can add a subscription node to a stream through methods like [then](/en/api/observable#then), [$then](/en/api/observable#then-1), [thenOnce](/en/api/observable#thenonce), [$thenOnce](/en/api/observable#thenonce-1), [thenImmediate](/en/api/observable#thenimmediate), [$thenImmediate](/en/api/observable#thenimmediate-1), [get](/en/api/observable#get), [change](/en/api/observable#change), etc. These methods return an `Observable` instance of the subscription node, maintaining consistency with `promise` usage.

## Chained Subscription

Call methods like [$then](/en/api/observable#then-1) on the subscription node's [observable](/en/api/observable) for chained subscription, similar to `promise`'s chained `then` methods.

## Partial Subscription

Call methods like [get](/en/api/observable#get) on the subscription node's [observable](/en/api/observable) for partial subscription, only subscribing to changes in the data obtained by `get`.

## Conditional Subscription

Only when nodes meet conditions will data be pushed. You can use the [change](/en/api/observable#change) method of the subscription node's [observable](/en/api/observable) or the [filter](/en/api/operator/filter) operator for conditional subscription. Only when conditions are met will data be pushed. The difference between the two is:

- The `change` method takes a `getter` function, passing in the previous data and current data respectively and comparing the return values. Data will only be pushed if there are changes.
- The `filter` method takes a `condition` function, passing in the current data. Data will only be pushed if it returns `true`.

## Unsubscribe

Call the [unsubscribe](/en/api/observable#unsubscribe) method of the subscription node's [observable](/en/api/observable) to cancel the subscription.

## Completion

Only [`Stream`](/en/api/stream) can be completed. Completion means the stream will no longer push new data.

```typescript
import { Stream } from 'fluth'

const promise$ = new Stream()

promise$.next(1, true) // true indicates completion, last stream push
```

After executing this final data push, each subscription node will trigger the [`afterComplete`](/en/api/observable#aftercomplete) callback and automatically unsubscribe all subscribers, triggering the [`afterUnsubscribe`](/en/api/observable#afterunsubscribe) of all child nodes.
