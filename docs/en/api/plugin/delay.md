# Delay

- Details

  A [chain](/en/guide/plugin.html#chain-plugin) plugin that delays pushing the stream to its child subscription nodes for a specified time after being called.

- Type

  ```typescript
  delay: (delayTime: number) => Observable;
  ```

- Example

  ```typescript
  import { $, delay } from "fluth";

  const promise$ = $().use(delay);

  promise$
    .then((value) => console.log(value))
    .delay(1000)
    .then((value) => console.log(value));
  promise$.next(1);
  // prints value 1
  // sleep 1000ms
  // prints value 1
  ```
