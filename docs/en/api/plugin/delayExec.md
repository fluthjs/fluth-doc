# Delay Execution

- Details

  An [execute](/en/guide/plugin.html#execute-plugin) plugin that delays pushing the processing result to its child subscription nodes for a specified time after the stream reaches the subscription node.

- Example

  ```typescript
  import { $, delayExec } from "fluth";

  const promise$ = $().use(delayExec(100), consoleExec());

  promise$.then((value) => value + 1).then((value) => value + 1);

  promise$.next(1);

  // Output:
  // sleep 100ms
  // value 1
  // sleep 100ms
  // value 2
  // sleep 100ms
  // value 3
  ```
