# partition

Partitions the input [stream](/en/api/stream#stream) or [subjection](/en/api/stream#subjection) based on a predicate function, returning two streams: the first stream contains values that satisfy the condition, and the second stream contains values that do not satisfy the condition.

![image](/partition.drawio.svg)

- Type

  ```typescript
  type partition: (
    stream$: Stream | Subjection,
    predicate: (this: any, value: any, index: number) => boolean,
    thisArg?: any,
  ) => Stream[];
  ```

- Details

  - Divides the input stream based on the predicate function, returning two streams: the first stream contains values that satisfy the condition, and the second stream contains values that do not satisfy the condition.
  - When the input stream unsubscribes, both returned streams will also unsubscribe.
  - When the input stream [finishes](/en/guide/base#completion), the corresponding returned streams will also finish.

- Example

  ```typescript
  import { $, partition } from "fluth";

  const stream$ = $(0);

  const [stream1$, stream2$] = partition(stream$, (value) => value % 2 === 0);

  stream1$.then((value) => console.log("first stream", value));
  stream2$.then((value) => console.log("second stream", value));

  stream$.next(1);
  // prints: second stream 1
  stream$.next(2);
  // prints: first stream 2
  stream$.next(3);
  // prints: second stream 3
  stream$.next(4);
  // prints: first stream 4
  ```
