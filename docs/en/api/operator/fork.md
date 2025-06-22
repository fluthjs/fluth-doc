# fork

Creates a new stream from the input [stream](/en/api/stream#stream) or [subjection](/en/api/stream#subjection)

- Type

  ```typescript
  type fork = (arg$: Stream | Subjection) => Stream;
  ```

- Details

  - This is a stream forking operation, returning a new stream
  - When the input stream unsubscribes, the new stream will also unsubscribe
  - When the input stream [finishes](/en/guide/base#completion), the new stream will also finish

::: warning Difference from `pipe`
`fork` returns a `Stream` while `pipe` returns a `Subjection`, which means that `fork` can not only subscribe to upstream streams but can also actively publish data
:::

- Example

  ```typescript
  import { $, fork } from "fluth";

  const source$ = $("initial value");
  const fork$ = fork(source$);

  fork$.then((value) => {
    console.log("Forked value:", value);
  });

  console.log(fork$.value);
  // prints: initial value
  source$.next("new value");
  // prints: Forked value: new value
  fork$.next("new forked value");
  // prints: Forked value: new forked value
  ```
