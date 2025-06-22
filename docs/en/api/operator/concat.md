# concat

Combines input [streams](/en/api/stream#stream) or [subjections](/en/api/stream#subjection) in sequence, returning a new stream.

![image](/concat.drawio.svg)

- Type

  ```typescript
  type concat: (...args: (Stream | Subjection)[]) => Stream;
  ```

- Details

  - Data from the next input stream will only be pushed to the new stream after the current input stream has [finished](/en/guide/base#completion).
  - The new stream will also unsubscribe when the current input stream unsubscribes.

- Example

  ```typescript
  import { $, concat } from "fluth";

  const stream1$ = $(1);
  const stream2$ = $("hello");

  const concat$ = concat(stream1$, stream2$);
  concat$.then((value) => console.log(value));
  console.log(concat$.value);
  // prints: undefined

  stream1$.next(2);
  // prints: 2
  stream2$.next("world");
  stream1$.next(3, true);
  // prints: 3
  stream2$.next("word");
  // prints: word
  ```
