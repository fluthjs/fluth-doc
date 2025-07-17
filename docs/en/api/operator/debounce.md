# debounce

Debounce operator, delays data emission until no new data is emitted within the specified time.

- Type

  ```typescript
  type debounce = (debounceTime: number) => (observable$: Observable) => Observable
  ```

- Details

  - Accepts a debounce time parameter (milliseconds)
  - The first emission will not execute immediately, but will wait for the debounce time

- Example

  ```typescript
  import { $, debounce } from 'fluth'

  const stream$ = $(1)

  // Use debounce operator, debounce time 500ms
  const debounced$ = stream$.pipe(debounce(500))

  debounced$.then((value) => {
    console.log('Debounced value:', value)
  })

  // Rapidly emit data
  stream$.next(2)
  stream$.next(3)
  stream$.next(4)
  stream$.next(5)

  // Output: After waiting 500ms, only the last emitted value is output
  // Debounced value: 5
  ```
