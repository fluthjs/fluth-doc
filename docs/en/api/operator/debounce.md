# debounce

Debounce operator that delays pushing data until no new data is pushed within a specified time.

- Type

  ```typescript
  type debounce = (debounceTime: number) => (observable$: Observable) => Observable;
  ```

- Details

  - Receives a debounce time parameter (milliseconds)
  - Returns a function that takes an Observable and returns a new Observable
  - The new Observable will only push data after no new data has been pushed for the specified time
  - Uses setTimeout to implement debouncing functionality
  - Cleans up timers when the stream unsubscribes
  - The first push will not execute immediately, but will wait for the debounce time

- Example

  ```typescript
  import { $, debounce } from "fluth";

  const stream$ = $(1);

  // Use debounce operator with 500ms debounce time
  const debounced$ = stream$.pipe(debounce(500));

  debounced$.then((value) => {
    console.log("Debounced value:", value);
  });

  // Rapidly push data
  stream$.next(2);
  stream$.next(3);
  stream$.next(4);
  stream$.next(5);

  // Output: Waits 500ms then only prints the last pushed value
  // Debounced value: 5
  ```

- Relationship with other APIs

  - Difference from `debounce` plugin: `debounce` is an operator, the plugin version is a chain plugin
  - Operator version uses `pipe`, plugin version uses `use`
  - Commonly used for search input, window resize, and other scenarios
