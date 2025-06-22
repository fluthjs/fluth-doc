# combine

Combines input [streams](/en/api/stream#stream) or [subjections](/en/api/stream#subjection) and returns a new stream.

![image](/combine.drawio.svg)

- Type

  ```typescript
  type combine: (...args: (Stream | Subjection)[]) => Stream;
  ```

- Details

  - The new stream will only emit its first data after all input streams have emitted their first data.
  - The new stream will unsubscribe when all input streams are unsubscribed.
  - The new stream will [finish](/en/guide/base#completion) when all input streams have finished.

- Example

  ```typescript
  import { $, combine } from "fluth";

  const stream1$ = $(1);
  const stream2$ = $("hello");
  const stream3$ = $(true);

  const combined$ = combine(stream1$, stream2$, stream3$);
  combined$.then((value) => console.log(value));
  console.log(combined$.value);
  // prints: undefined

  stream1$.next(2);
  stream2$.next("world");
  stream3$.next(false);
  // prints: [2, "world", false]

  stream1$.next(3);
  // prints: [3, "world", false]

  stream3$.next(true);
  // prints: [3, "world", true]
  ```
