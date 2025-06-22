# promiseAll

Combines input [streams](/en/api/stream#stream) or [subjections](/en/api/stream#subjection), similar to Promise.all behavior, returning a new stream

![image](/promiseAll.drawio.svg)

- Type

  ```typescript
  type promiseAll: (...args: (Stream | Subjection)[]) => Stream;
  ```

- Details

  - The new stream will only emit its first data after all input streams have emitted their first data
  - The new stream will only emit new data when and only when all input streams push new data
  - After all input streams [finish](/en/guide/base#completion), the new stream will also finish
  - After all input streams unsubscribe, the new stream will also unsubscribe

- Example

  ```typescript
  import { $, promiseAll } from "fluth";

  const stream1$ = $(1);
  const stream2$ = $("hello");
  const stream3$ = $(true);

  const promiseAll$ = promiseAll(stream1$, stream2$, stream3$);

  promiseAll$.then((value) => console.log(value));
  console.log(promiseAll$.value);
  // prints: undefined

  stream1$.next(2);
  stream2$.next("world");
  stream3$.next(false);
  // prints: [2, "hello", true]

  stream1$.next(3);
  stream1$.next(4);
  stream3$.next(true);
  stream2$.next("world");
  // prints: [4, "world", true]
  ```