# merge

Merges the input [streams](/en/api/stream#stream) or [subjections](/en/api/stream#subjection), returning a new stream.

![image](/merge.drawio.svg)

- Type

  ```typescript
  type merge: (...args: (Stream | Subjection)[]) => Stream;
  ```

- Details

  - Stream merging operation refers to pushing data to the new stream in time order, as long as any input stream pushes data.
  - The new stream will unsubscribe when all input streams are unsubscribed.
  - The new stream will [finish](/en/guide/base#completion) when all input streams have finished.

- Example

  ```typescript
  import { $, merge } from "fluth";

  const stream1$ = $(1);
  const stream2$ = $("hello");
  const stream3$ = $(true);

  const merged$ = merge(stream1$, stream2$, stream3$);

  merged$.then((value) => console.log(value));
  console.log(merged$.value);
  // prints: undefined

  stream1$.next(2);
  // prints: 2
  stream2$.next("world");
  // prints: world
  stream3$.next(false);
  // prints: false
  stream1$.next(3);
  // prints: 3
  ```
