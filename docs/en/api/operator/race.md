# race

The input [streams](/en/api/stream#stream) or [subjections](/en/api/stream#subjection) compete, returning a new stream that forks from the stream that pushes data first.

![image](/race.drawio.svg)

- Type

  ```typescript
  type race: (...args: (Stream | Subjection)[]) => Stream;
  ```

- Details
  - After the input stream unsubscribes or [finishes](/en/guide/base#completion), the new stream will also unsubscribe or finish.
