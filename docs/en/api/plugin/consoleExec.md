# Console Execution

- Details

  An [execute](/en/guide/plugin.html#execute-plugin) plugin that prints out the data after it reaches the subscription node.

- Example

  ```typescript
  import { $, consoleExec } from "fluth";

  const promise$ = $().use(consoleExec());

  promise$.then((value) => value + 1).then((value) => value + 1);

  promise$.next(1);
  // Output:
  // value 1
  // value 2
  // value 3
  ```
