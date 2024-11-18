# pipe

Creates a new subscription node from an input [stream](/en/api/stream#stream) or [subjection](/en/api/stream#subjection)

- Type

  ```typescript
  type fork = (arg$: Stream | Subjection) => Subjection;
  ```

- Details

  - A stream subscription operation that returns a new subscription node
  - When the input stream unsubscribes, the new subscription node will also unsubscribe
  - When the input stream [completes](/en/guide/base#completion), the new subscription node will also complete
