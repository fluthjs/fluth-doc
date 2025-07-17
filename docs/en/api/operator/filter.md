# filter

Filter operator that filters data based on a condition function, only pushing data that satisfies the condition.

- Type

  ```typescript
  type filter = <T>(condition: (value: T) => boolean) => (observable$: Observable<T>) => Observable<T>;
  ```

- Details

  - Receives a condition function parameter that takes a data value and returns a boolean
  - Returns a function that takes an Observable and returns a new Observable
  - The new Observable will only push data that satisfies the condition
  - Pushes data when the condition function returns `true`, skips when it returns `false`
  - Uses the third parameter (condition function) of Observable's `then` method to implement filtering

- Example

  ```typescript
  import { $, filter } from "fluth";

  const stream$ = $(1);

  // Use filter operator to only receive data greater than 2
  const filtered$ = stream$.pipe(filter((value) => value > 2));

  filtered$.then((value) => {
    console.log("Filtered value:", value);
  });

  // Push data
  stream$.next(1); // Doesn't satisfy condition, skip, no output
  stream$.next(2); // Doesn't satisfy condition, skip, no output
  stream$.next(3); // Satisfies condition, print: Filtered value: 3
  stream$.next(4); // Satisfies condition, print: Filtered value: 4
  stream$.next(1); // Doesn't satisfy condition, skip, no output
  ```

- Relationship with other APIs

  - Difference from Observable's `filter` method: The operator version can be used independently, the method version is for chaining
  - Operator version uses `pipe`
  - Commonly used for data preprocessing and conditional filtering
