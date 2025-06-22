# finish

Combines the data after the input [streams](/en/api/stream#stream) or [subjections](/en/api/stream#subjection) have finished, returning a new stream.

![image](/finish.drawio.svg)

- Type

  ```typescript
  type combine: (...args: (Stream | Subjection)[]) => Stream;
  ```

- Details

  - The new stream will only emit its first data after all input streams have [finished](/en/guide/base#completion).
  - The new stream will also finish after emitting its first data.
  - The new stream will unsubscribe when all input streams are unsubscribed.

- Example

  ```typescript
  import { $, finish } from "fluth";

  const stream1$ = $(1);
  const stream2$ = $("hello");
  const stream3$ = $(true);

  const finish$ = finish(stream1$, stream2$, stream3$);
  finish$.then((value) => console.log(value));
  console.log(finish$.value);
  // prints: undefined

  stream1$.next(2);
  stream1$.next(3, true);
  stream2$.next("world", true);
  stream3$.next(false, true);
  // prints: [3, "world", false]
  ```
