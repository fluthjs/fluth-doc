# skipFilter

Skip filter operator that determines whether to skip data pushes based on a filter function.

- Type

  ```typescript
  type skipFilter = (filter: (time: number) => boolean) => (observable$: Observable) => Observable;
  ```

- Details

  - Receives a filter function parameter that takes the current push count and returns a boolean
  - Returns a function that takes an Observable and returns a new Observable
  - The new Observable will decide whether to push data based on the filter function's return value
  - Pushes data when the filter function returns `true`, skips when it returns `false`
  - Uses a counter to track push count

- Example

  ```typescript
  import { $, skipFilter } from "fluth";

  const stream$ = $(1);

  // Use skipFilter operator to only receive even-numbered pushes
  const filtered$ = stream$.pipe(skipFilter((time) => time % 2 === 0));

  filtered$.then((value) => {
    console.log("Value after filter:", value);
  });

  // Push data
  stream$.next(2); // 1st push, skip, no output
  stream$.next(3); // 2nd push, print: Value after filter: 3
  stream$.next(4); // 3rd push, skip, no output
  stream$.next(5); // 4th push, print: Value after filter: 5
  ```

- Relationship with other APIs

  - Difference from `skipFilter` plugin: `skipFilter` is an operator, the plugin version is a chain plugin
  - Operator version uses `pipe`, plugin version uses `use`
  - More flexible than `skip`, can decide whether to skip based on complex conditions
