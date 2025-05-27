# Basic Concepts

## Streams

In `fluth`, there are two types of streams: [`Stream`](/en/api/stream) and [`Observable`](/en/api/observable). A stream is a subscribable data source, and the [subscription node](#subscription-nodes) obtained after subscribing to a `Stream` is an `Observable` stream.

The main difference between `Stream` and `Observable` is that `Stream` can actively push data, while `Observable` can only passively push data or repeat the last push.

```typescript
import { $ } from "fluth";

const promise$ = $();

const observable$ = promise$.then(xxx);

const observable1$ = observable$.then(xxx);

promise$.next(xxx); // push data
```

## Publishing Data

Publishing data means pushing new data sources to subscription nodes. There are two types of data publishing: active and passive. Active publishing means nodes can actively push data, while passive publishing means nodes can only passively receive data, process it, and then push the processed data to subscription nodes.

- [`Stream`](/en/api/stream) can use the `next` method for active data publishing, and all subscription nodes will receive the pushed data

```typescript
import { Stream } from "fluth";

const promise$ = new Stream();

promise$.then((data) => console.log(data));

promise$.next("hello"); // prints hello
```

- You can also use the `set` method for data publishing, which differs from the `next` method in that the `set` method pushes `immutable` data based on the last data.

```typescript
import { $ } from "fluth";
const promise$ = $({ a: 1, b: { c: 2 } });
const oldValue = promise$.value;

promise$.set((state) => (state.a = 3));
const newValue = promise$.value;

console.log(oldValue === newValue); // false
console.log(oldValue.b === newValue.b); // true
```

## Execution

Call the [execute](/en/api/observable#execute) method of the subscription node [observable](/en/api/observable) to re-execute the last subscribed data stream and push it to all its child subscription nodes.

## Subscription Nodes

`fluth` uses a `promise`-like approach for data stream pushing. You can add a subscription node using [then](/en/api/observable#then), [$then](/en/api/observable#then-1), [thenOnce](/en/api/observable#thenonce), [$thenOnce](/en/api/observable#thenonce-1), [thenImmediate](/en/api/observable#thenimmediate), [$thenImmediate](/en/api/observable#thenimmediate-1), [get](/en/api/observable#get), [change](/en/api/observable#change), [filter](/en/api/observable#filter) methods, which return an `Observable` instance. The overall usage is consistent with `promise`.

## Chain Subscription

Call the [$then](/en/api/observable#then-1) method of the subscription node [observable](/en/api/observable) for chain subscription, similar to the `then` chain method of `promise`.

## Partial Subscription

Call the [get](/en/api/observable#get) method of the subscription node [observable](/en/api/observable) for partial subscription, subscribing only to changes in the data obtained by `get`.

## Conditional Subscription

Only nodes that meet the conditions will push data. Call the [change](/en/api/observable#change) and [filter](/en/api/observable#filter) methods of the subscription node [observable](/en/api/observable) for conditional subscription. The difference between the two is:

- The `change` method takes a `getter` function, passing in the last data and the current data, and compares the return value. If there is a change, it will push data.
- The `filter` method takes a `condition` function, passing in the current data. If it returns `true`, it will push data.

## Unsubscribe

Call the [unsubscribe](/en/api/observable#unsubscribe) method of the subscription node [observable](/en/api/observable) to unsubscribe.

## Completion

Only [`Stream`](/en/api/stream) can be completed. Completion means the stream will no longer push new data.

```typescript
import { Stream } from "fluth";

const promise$ = new Stream();

promise$.next(1, true); // true indicates completion, last stream push
```

After executing this final data push, each subscription node will trigger the [`complete`](/en/api/observable#complete) callback and automatically unsubscribe all subscribers, triggering the [`setUnsubscribeCallback`](/en/api/observable#setunsubscribecallback) of all child nodes.
