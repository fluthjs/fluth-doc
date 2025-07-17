# delay

Delay operator, delays the emission of data from the input stream by the specified time before pushing it to the subscriber node.

## Type Definition

```typescript
type delay = <T>(delayTime: number) => (observable$: Observable<T>) => Observable<T>
```

## Details

- Accepts a delay time parameter (milliseconds)
- Returns a function that takes an Observable and returns a new Observable
- The new Observable will emit data to the subscriber node after the specified delay
- Uses Promise and setTimeout to implement the delay function

## Example

```typescript
import { $, delay } from 'fluth'

const stream$ = $(1)

// Use delay operator, delay 1000ms
const delayed$ = stream$.pipe(delay(1000))

delayed$.then((value) => {
  console.log('Delayed value:', value)
})

stream$.next(2)
stream$.next(3)

// Output:
// After 1000ms: Delayed value: 2
// After 1000ms: Delayed value: 3
```
