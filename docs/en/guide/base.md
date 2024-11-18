# Basic Concepts

## Streams

There are two types of streams in `fluth`: [ Stream ](/en/api/stream#stream) and [ Subjection ](/en/api/stream#subjection). A stream is essentially a subscribable data source.

```typescript
import { Stream } from "fluth";

const promise$ = new Stream();

const subjection$ = promise$.then(xxx);
```

## Publishing Data

[ Stream ](/en/api/stream#stream) can push data using the `next` method. All subscription nodes will receive the pushed data.

```typescript
import { Stream } from "fluth";

const promise$ = new Stream();

promise$.then((data) => console.log(data));

promise$.next("hello"); // prints hello
```

## Subscription Nodes

`fluth` uses a `promise`-like approach for data stream pushing. You can add a subscription node using [then](/en/api/stream#then) or [thenOnce](/en/api/stream#thenonce) methods, which return a `Subjection` instance. The overall usage is consistent with `promise`.

## Chain Subscription

Call the `then` method of the [subjection](/en/api/stream#subjection) node for chain subscription.

## Unsubscribe

Call the `unsubscribe` method of the [subjection](/en/api/stream#subjection) node to cancel the subscription.

## Manual Execution

Call the `execute` method of the [subjection](/en/api/stream#subjection) node to re-execute the last subscribed data stream.

## Completion

Only [ Stream ](/en/api/stream#stream) can be completed. Completion means the stream will no longer push new data.

```typescript
import { Stream } from "fluth";

const promise$ = new Stream();

promise$.next(1, true); // true indicates completion, last stream push
```

After executing this final data push, each subscription node will trigger the [finish](/en/api/stream#finish) promise and automatically unsubscribe.
