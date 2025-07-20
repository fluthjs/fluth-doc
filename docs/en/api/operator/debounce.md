# debounce

Debounce operator, delays data emission until no new data is emitted within the specified time.

## Type Definition

```typescript
type debounce = (debounceTime: number) => (observable$: Observable) => Observable
```

## Parameters

- `debounceTime` (`number`): Debounce time interval in milliseconds

## Details

- All emissions are not executed immediately, including the first emission
- Only emits the last value when no new emissions occur within the debounce time
- Each new emission resets the debounce timer
- Uses internal timers to manage delayed emissions with proper cleanup
- Suitable for scenarios that need to wait for input stabilization before execution

## Examples

### Scenario 1: Basic debouncing

```typescript
import { $, debounce } from 'fluth'

const stream$ = $()

// Use debounce operator, debounce time 100ms
const debounced$ = stream$.pipe(debounce(100))

debounced$.then((value) => {
  console.log('Debounced value:', value)
})

// Rapid consecutive emissions
stream$.next(1)
setTimeout(() => stream$.next(2), 30)
setTimeout(() => stream$.next(3), 60)
setTimeout(() => stream$.next(4), 90)

// Only the last emission will be emitted after debounce time
// After 190ms output: Debounced value: 4
```

### Scenario 2: Multiple debounce cycles

```typescript
import { $, debounce } from 'fluth'

const stream$ = $()
const debounced$ = stream$.pipe(debounce(50))

debounced$.then((value) => {
  console.log('Debounced:', value)
})

// First batch of rapid emissions
stream$.next('a')
setTimeout(() => stream$.next('b'), 20)
setTimeout(() => stream$.next('c'), 40)
setTimeout(() => stream$.next('d'), 45)

// After 50ms output: Debounced: d

// After debounce completes, new emission
setTimeout(() => {
  stream$.next('e') // New debounce cycle starts
}, 120)

// At 170ms output: Debounced: e
```

### Scenario 3: Search input debouncing

```typescript
import { $, debounce } from 'fluth'

const searchInput$ = $()
const debouncedSearch$ = searchInput$.pipe(debounce(300))

debouncedSearch$.then((keyword) => {
  console.log('Execute search:', keyword)
  // Actual search API call
})

// Simulate user input process
searchInput$.next('a')
setTimeout(() => searchInput$.next('ap'), 100)
setTimeout(() => searchInput$.next('app'), 200)
setTimeout(() => searchInput$.next('apple'), 250)

// Only the final 'apple' triggers search at 550ms
// Output: Execute search: apple
```

### Scenario 4: Form validation debouncing

```typescript
import { $, debounce } from 'fluth'

const formInput$ = $()
const debouncedValidation$ = formInput$.pipe(debounce(500))

debouncedValidation$.then((value) => {
  console.log('Validate input:', value)
  // Execute form validation logic
  if (value.length < 3) {
    console.log('Input too short')
  } else {
    console.log('Input valid')
  }
})

// Simulate user input
formInput$.next('a')
setTimeout(() => formInput$.next('ab'), 200)
setTimeout(() => formInput$.next('abc'), 400)
setTimeout(() => formInput$.next('abcd'), 600)

// Output:
// After 900ms: Validate input: abc
// After 1100ms: Validate input: abcd
```

### Scenario 5: Window resize event debouncing

```typescript
import { $, debounce } from 'fluth'

const windowResize$ = $()
const debouncedResize$ = windowResize$.pipe(debounce(250))

debouncedResize$.then((dimensions) => {
  console.log('Window resize complete:', dimensions)
  // Execute layout recalculation
})

// Simulate rapid window resize events
windowResize$.next({ width: 800, height: 600 })
setTimeout(() => windowResize$.next({ width: 850, height: 650 }), 50)
setTimeout(() => windowResize$.next({ width: 900, height: 700 }), 100)
setTimeout(() => windowResize$.next({ width: 950, height: 750 }), 150)

// After 400ms output: Window resize complete: { width: 950, height: 750 }
```

### Scenario 6: Unsubscribe cleanup

```typescript
import { $, debounce } from 'fluth'

const stream$ = $()
const debounced$ = stream$.pipe(debounce(100))

debounced$.then((value) => {
  console.log('Debounced value:', value)
})

stream$.next(1)
setTimeout(() => {
  // Unsubscribe before debounce completes
  debounced$.unsubscribe()
}, 50)

// No output, because unsubscribed before debounce completion
```

## Relationship with Other Operators

- **vs `throttle`**: `debounce` delays all emissions, `throttle` first emission passes immediately
- **Debouncing strategy**: Timer reset strategy, ensures execution only after input stabilization
- **Use cases**: Search input, form validation, window resize events, etc., where waiting for user operation completion is needed
