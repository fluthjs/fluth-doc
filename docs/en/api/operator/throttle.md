# throttle

Throttle operator that limits the frequency of data pushing, ensuring only the last data is pushed within a specified time interval.

- Type

  ```typescript
  type throttle = (throttleTime: number) => (observable$: Observable) => Observable;
  ```

- Details

  - Receives a throttle time parameter (milliseconds)
  - Returns a function that takes an Observable and returns a new Observable
  - The new Observable will only push the last data within the specified time interval
  - Uses timestamps and setTimeout to implement throttling functionality
  - Cleans up timers when the stream unsubscribes

- Example

  ```typescript
  import { $, throttle } from "fluth";

  const stream$ = $(1);

  // Use throttle operator with 300ms throttle time
  const throttled$ = stream$.pipe(throttle(300));

  throttled$.then((value) => {
    console.log("Throttled value:", value);
  });

  // Rapidly push data
  stream$.next(2);
  stream$.next(3);
  stream$.next(4);
  stream$.next(5);

  // Output: Only prints the last pushed value
  // Throttled value: 5
  ```

- Relationship with other APIs

  - Difference from `throttle` plugin: `throttle` is an operator, the plugin version is a chain plugin
  - Operator version uses `pipe`, plugin version uses `use`
  - Commonly used for handling high-frequency events like user input
