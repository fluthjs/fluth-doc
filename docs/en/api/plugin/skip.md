# skip

Skips a specified number of emissions or emissions that meet certain conditions

- Type

  ```typescript
  skip: (skipTime: number) => Observable;
  skipFilter: (filter: (time: number) => boolean) => Observable;
  ```

- Details

  - `skip(skipTime)`: Skips the first `skipTime` emissions, starts receiving data from the `skipTime + 1`th emission
  - `skipFilter(filter)`: Determines whether to skip emissions based on a filter function. The `filter` function receives the current emission count as a parameter, returns `true` to receive data, returns `false` to skip

- Example

  ```typescript
  import { $, skip } from "fluth";

  const stream$ = $(0).use(skip);

  // Skip the first 2 emissions
  const skipped$ = stream$.skip(2);
  skipped$.then((value) => console.log("skip:", value));

  // Skip using filter function
  const skipFiltered$ = stream$.skipFilter((time) => time > 3);
  skipFiltered$.then((value) => console.log("skipFilter:", value));

  stream$.next(1); // no output
  stream$.next(2); // no output
  stream$.next(3); // prints: skip: 3
  stream$.next(4); // prints: skip: 4, skipFilter: 4
  stream$.next(5); // prints: skip: 5, skipFilter: 5
  ```
