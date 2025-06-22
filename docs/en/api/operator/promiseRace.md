# promiseRace

The input [streams](/en/api/stream#stream) or [subjections](/en/api/stream#subjection) compete, returning a new stream that `fork`s from the stream that pushes data first.

![image](/promiseRace.drawio.svg)

- Type

  ```typescript
  type promiseRace: (...args: (Stream | Subjection)[]) => Stream;
  ```

- Details

  - After the input stream unsubscribes or [finishes](/en/guide/base#completion), the new stream will also unsubscribe or finish.

- Example

  ```typescript
  import { $, promiseRace } from "fluth";

  const stream1$ = $(1);
  const stream2$ = $("hello");
  const stream3$ = $(false);

  const promiseRace$ = promiseRace(stream1$, stream2$, stream3$);
  promiseRace$.then((value) => console.log(value));

  stream2$.next("world");
  // prints: "hello"
  stream3$.next(true);
  stream1$.next(3);
  stream2$.next("code");
  // prints: "code"
  ```
