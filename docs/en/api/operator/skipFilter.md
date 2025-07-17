# skipFilter

Skip-filter operator, determines whether to skip data emission based on a filter function.

- Type

  ```typescript
  type skipFilter = (filter: (time: number) => boolean) => (observable$: Observable) => Observable
  ```

- Details

  - Accepts a filter function parameter, which receives the current emission count and returns a boolean
  - Returns a function that takes an Observable and returns a new Observable
  - The new Observable will determine whether to emit data based on the return value of the filter function
  - If the filter function returns `true`, the data is emitted; if it returns `false`, the data is skipped
  - Uses a counter to track the number of emissions

- Example

  ```typescript
  import { $, skipFilter } from 'fluth'

  const stream$ = $(1)

  // Use skipFilter operator, only receive even-numbered emissions
  const filtered$ = stream$.pipe(skipFilter((time) => time % 2 === 0))

  filtered$.then((value) => {
    console.log('Value received after filter:', value)
  })

  // Emit data
  stream$.next(2) // 1st time, skipped, no output
  stream$.next(3) // 2nd time, Output: Value received after filter: 3
  stream$.next(4) // 3rd time, skipped, no output
  stream$.next(5) // 4th time, Output: Value received after filter: 5
  ```

- Relationship with other APIs

  - Difference from `skipFilter` plugin: `skipFilter` is an operator, the plugin version is a chain plugin
  - Operator version uses `pipe`, plugin version uses `use`
  - More flexible than `skip`, can determine whether to skip based on complex conditions
