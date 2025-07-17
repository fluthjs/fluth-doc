# throttle

Throttle operator, limits the frequency of data emissions, ensuring that only the last emission within the specified interval is pushed.

## Type Definition

```typescript
type throttle = (throttleTime: number) => (observable$: Observable) => Observable
```

## Details

- Accepts a throttle time parameter (milliseconds)
- Only the last data emission within the interval will be emitted

## Example

```typescript
import { $, throttle } from 'fluth'

const stream$ = $(1)

// Use throttle operator, throttle time 300ms
const throttled$ = stream$.pipe(throttle(300))

throttled$.then((value) => {
  console.log('Value after throttle:', value)
})

// Rapidly emit data
stream$.next(2)
stream$.next(3)
stream$.next(4)
stream$.next(5)

// Output: Only the last emission within the interval is output
// Value after throttle: 5
```
