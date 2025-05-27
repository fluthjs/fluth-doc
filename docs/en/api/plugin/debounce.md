# Debounce

- Details

  A [chain](/en/guide/plugin.html#chain-plugin) plugin that applies debouncing to the stream before pushing the processing result to its child subscription nodes.

- Example

  ```typescript
  import { $, debounce } from "fluth";

  const promise$ = $().use(debounce);
  promise$.debounce(100).then((value) => {
    console.log(value);
  });
  promise$.next(1);
  promise$.next(2);
  promise$.next(3);
  promise$.next(4);
  promise$.next(5); // prints 5
  ```
