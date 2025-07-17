# skip

Skip operator that skips a specified number of data pushes and starts receiving data from the N+1th push.

- Type

  ```typescript
  type skip = <T>(skipTime: number) => (observable$: Observable<T>) => Observable<T>;
  ```

- Details

  - Receives a skip count parameter
  - Returns a function that takes an Observable and returns a new Observable
  - The new Observable will skip the first N data pushes and start receiving data from the N+1th push
  - Uses a counter to implement the skip functionality
  - After the skip count is reached, all subsequent data will be pushed normally

- Example

  ```typescript
  import { $, skip } from "fluth";

  const stream$ = $(1);

  // Use skip operator to skip the first 2 pushes
  const skipped$ = stream$.pipe(skip(2));

  skipped$.then((value) => {
    console.log("Value after skip:", value);
  });

  // Push data
  stream$.next(2); // Skip, no output
  stream$.next(3); // Skip, no output
  stream$.next(4); // Print: Value after skip: 4
  stream$.next(5); // Print: Value after skip: 5
  ```

- Relationship with other APIs

  - Difference from `skip` plugin: `skip` is an operator, the plugin version is a chain plugin
  - Operator version uses `pipe`, plugin version uses `use`
  - Commonly used to ignore initial data or skip a specific number of pushes
