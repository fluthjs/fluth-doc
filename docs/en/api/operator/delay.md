# delay

Delay operator that delays pushing data from the input stream to subscription nodes for a specified time.

- Type

  ```typescript
  type delay = <T>(delayTime: number) => (observable$: Observable<T>) => Observable<T>;
  ```

- Details

  - Receives a delay time parameter (milliseconds)
  - Returns a function that takes an Observable and returns a new Observable
  - The new Observable will delay pushing data to subscription nodes for the specified time
  - Uses Promise and setTimeout to implement the delay functionality

- Example

  ```typescript
  import { $, delay } from "fluth";

  const stream$ = $(1);

  // Use delay operator with 1000ms delay
  const delayed$ = stream$.pipe(delay(1000));

  delayed$.then((value) => {
    console.log("Delayed value:", value);
  });

  stream$.next(2);
  stream$.next(3);

  // Output:
  // After 1000ms delay: Delayed value: 2
  // After 1000ms delay: Delayed value: 3
  ```

- Relationship with other APIs

  - Difference from `delayExec` plugin: `delay` is an operator, `delayExec` is a plugin
  - Difference from `delay` plugin: operator version uses `pipe`, plugin version uses `use`
  - Supports chaining
