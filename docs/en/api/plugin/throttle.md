# Throttle

- Details

  A [chain](/en/guide/plugin.html#chain-plugin) plugin that applies throttling to the stream before pushing it to its child subscription nodes.

- Type

  ```typescript
  throttle: (throttleTime: number) => Observable;
  ```

- Example
  ```typescript
  import { $, throttle } from "fluth";
  const promise$ = $().use(throttle(100), consoleExec());
  promise$.next(1);
  promise$.next(2);
  promise$.next(3);
  ```
