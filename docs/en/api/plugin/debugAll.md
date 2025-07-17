# debugAll

- Details

  An [executeAll](/en/guide/plugin.html#execute-plugin) plugin that triggers debugger breakpoints on all nodes when the stream reaches subscription nodes.

- Type

  ```typescript
  debugAll: () => ExecuteAllPlugin;
  ```

- Example

  ```typescript
  import { $, debugAll } from "fluth";

  const promise$ = $().use(debugAll());

  promise$.then((value) => value + 1).then((value) => value + 1);

  promise$.next(1);
  // Will trigger debugger breakpoints at each node in browser developer tools
  ```

  ```typescript
  import { $, debugAll } from "fluth";

  // Test executeAll propagation in stream chain
  const rootStream = $();
  rootStream.use(debugAll());

  const step1 = rootStream.then((value) => {
    console.log("step1 processing:", value);
    return value * 2;
  });

  const step2 = step1.then((value) => {
    console.log("step2 processing:", value);
    return value + 10;
  });

  step2.then((value) => {
    console.log("final result:", value);
  });

  rootStream.next(5);
  // Will trigger debugger breakpoints at each node:
  // 1. rootStream node
  // 2. step1 node
  // 3. step2 node
  // 4. final subscription node
  ```

  ```typescript
  import { $, debugAll } from "fluth";

  const promise$ = $().use(debugAll());

  promise$.then((value) => value + 1);

  const rejectedPromise = Promise.reject(new Error("test error"));
  promise$.next(rejectedPromise);
  // Will trigger debugger breakpoint during error handling
  ```

- Notes

  1. **Return Value**: The plugin returns the original `result` without modifying the data stream
  2. **Promise Handling**: For Promise results, it waits for the Promise to resolve before triggering debugger
  3. **Error Handling**: For rejected Promises, it triggers debugger during error handling
  4. **Skip Pass-through Nodes**: When `root=false` and there are no `onfulfilled` or `onrejected` handlers, debugger triggering is skipped
  5. **Plugin Removal**: The plugin can be removed using the `remove` method to stop debugging functionality
  6. **Development Environment**: Debugger functionality is mainly used in development environments, should be removed in production
  7. **Difference from debugNode**: `debugAll` triggers debugger on all nodes in the stream chain, while `debugNode` triggers only on individual nodes
