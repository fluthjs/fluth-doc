# change

Change detection operator that only triggers subsequent operations when the result of the getter function differs from the previous value.

## Type Definition

```typescript
change: <T>(getter: (value: T | undefined) => any) =>
  (observable$: Observable<T>) =>
    Observable<T>
```

## Parameters

- `getter` (Function): Function to extract comparison value from source data
  - Parameter: `value: T | undefined` - Current emitted data
  - Return: `any` - Value used for comparison

## Return Value

Returns a new Observable that only emits data when the getter function result changes.

## Core Behavior

- **Change Detection**: Uses strict equality comparison (===) to detect changes in getter function results
- **First Execution**: Always triggers on the first emission (since there's no previous value to compare)
- **Value Filtering**: Only passes data downstream when getter results differ
- **Original Data**: Passes the original complete data, not the getter result

## Usage Scenarios

### Scenario 1: Basic Numeric Value Change Detection

```typescript
import { $ } from 'fluth'

const promise$ = $<{ num: number }>()
promise$.pipe(change((value) => value?.num)).then(() => console.log('Number changed'))

promise$.next({ num: 1 }) // Triggers - first emission
promise$.next({ num: 2 }) // Triggers - number changed from 1 to 2
promise$.next({ num: 2 }) // No trigger - same number
promise$.next({ num: 1 }) // Triggers - number changed from 2 to 1
```

### Scenario 2: Nested Object Property Changes

```typescript
import { $ } from 'fluth'

const promise$ = $<{ user: { name: string; age: number } }>()
promise$.pipe(change((value) => value?.user.name)).then(() => console.log('Username changed'))

promise$.next({ user: { name: 'Alice', age: 25 } }) // Triggers
promise$.next({ user: { name: 'Bob', age: 25 } }) // Triggers - name changed
promise$.next({ user: { name: 'Bob', age: 30 } }) // No trigger - same name
promise$.next({ user: { name: 'Alice', age: 30 } }) // Triggers - name changed
```

### Scenario 3: Array Length Change Detection

```typescript
import { $ } from 'fluth'

const promise$ = $<{ items: number[] }>()
promise$
  .pipe(change((value) => value?.items?.length))
  .then(() => console.log('Array length changed'))

promise$.next({ items: [1, 2] }) // Triggers - length is 2
promise$.next({ items: [1, 2, 3] }) // Triggers - length changed to 3
promise$.next({ items: [1, 2, 3] }) // No trigger - same length
promise$.next({ items: [1] }) // Triggers - length changed to 1
```

### Scenario 4: Primitive Type Changes

```typescript
import { $ } from 'fluth'

const promise$ = $<string>()
promise$.pipe(change((value) => value)).then(() => console.log('String changed'))

promise$.next('hello') // Triggers
promise$.next('world') // Triggers
promise$.next('world') // No trigger - same value
promise$.next('hello') // Triggers
```

### Scenario 5: Boolean Status Changes

```typescript
import { $ } from 'fluth'

const promise$ = $<{ active: boolean }>()
promise$.pipe(change((value) => value?.active)).then(() => console.log('Status changed'))

promise$.next({ active: false }) // Triggers
promise$.next({ active: true }) // Triggers
promise$.next({ active: true }) // No trigger - same status
promise$.next({ active: false }) // Triggers
```

### Scenario 6: Complex Calculation Result Changes

```typescript
import { $ } from 'fluth'

const promise$ = $<{ x: number; y: number }>()
promise$
  .pipe(change((value) => (value ? value.x + value.y : 0)))
  .then(() => console.log('Calculation result changed'))

promise$.next({ x: 1, y: 2 }) // Triggers - sum is 3
promise$.next({ x: 2, y: 1 }) // No trigger - sum is still 3
promise$.next({ x: 3, y: 2 }) // Triggers - sum changed to 5
promise$.next({ x: 1, y: 4 }) // No trigger - sum is still 5
promise$.next({ x: 0, y: 0 }) // Triggers - sum changed to 0
```

## Edge Case Handling

### null and undefined Values

```typescript
import { $ } from 'fluth'

const promise$ = $<{ data: string | null }>()
promise$.pipe(change((value) => value?.data)).then(() => console.log('Data changed'))

promise$.next({ data: 'test' }) // Triggers
promise$.next({ data: null }) // Triggers - changed from 'test' to null
promise$.next({ data: null }) // No trigger - still null
promise$.next({ data: 'test' }) // Triggers - changed from null to 'test'
```

### Chained Change Operations

```typescript
import { $ } from 'fluth'

const promise$ = $<{ count: number }>()
const changed$ = promise$.pipe(change((value) => value?.count))
const doubled$ = changed$.pipe(change((value) => (value?.count || 0) * 2))

doubled$.then(() => console.log('Doubled value changed'))

promise$.next({ count: 1 }) // Triggers - doubled value is 2
promise$.next({ count: 2 }) // Triggers - doubled value is 4
promise$.next({ count: 2 }) // No trigger - doubled value is still 4
promise$.next({ count: 1 }) // Triggers - doubled value is 2
```

### Multiple Observers

```typescript
import { $ } from 'fluth'

const promise$ = $<{ status: string }>()
const changed$ = promise$.pipe(change((value) => value?.status))

changed$.then(() => console.log('Observer 1'))
changed$.then(() => console.log('Observer 2'))

promise$.next({ status: 'pending' }) // Both observers trigger
promise$.next({ status: 'success' }) // Both observers trigger
promise$.next({ status: 'success' }) // Neither observer triggers
promise$.next({ status: 'error' }) // Both observers trigger
```

## Combined with Conditional Execution

```typescript
import { $ } from 'fluth'

const promise$ = $<{ value: number }>()
promise$
  .pipe(change((value) => value?.value))
  .then(() => console.log('Value changed'))
  .then(
    () => console.log('Condition met'),
    undefined,
    (value: any) => value > 5 // Only execute when value > 5
  )

promise$.next({ value: 3 }) // Outputs 'Value changed'
promise$.next({ value: 7 }) // Outputs 'Value changed' and 'Condition met'
promise$.next({ value: 8 }) // Outputs 'Value changed' and 'Condition met'
promise$.next({ value: 4 }) // Outputs 'Value changed'
```

## Important Notes

1. **Strict Equality Comparison**: Uses `===` for comparison; for objects and arrays, same reference is required to be considered equal
2. **First Execution**: Always triggers on first emission since there's no previous value to compare
3. **Performance Consideration**: Getter function should be as simple as possible, avoiding complex calculations
4. **Memory Management**: Doesn't store historical data, only keeps the last getter result for comparison

## Relationship with Other Operators

- **vs filter**: `filter` filters data based on conditions, `change` filters based on value changes
- **vs get**: `get` extracts and monitors property changes, `change` can monitor any calculation result changes
- **vs throttle/debounce**: These operators control based on time, `change` controls based on value changes

## Complete Example: User Interface State Management

```typescript
import { $ } from 'fluth'

interface UIState {
  user: { id: number; name: string }
  theme: 'light' | 'dark'
  notifications: number
}

const uiState$ = $<UIState>()

// Monitor user changes
uiState$.pipe(change((state) => state?.user.id)).then((state) => {
  console.log('User switched:', state.user.name)
  // Reload user data
})

// Monitor theme changes
uiState$.pipe(change((state) => state?.theme)).then((state) => {
  console.log('Theme switched:', state.theme)
  // Update UI theme
})

// Monitor notification count changes
uiState$.pipe(change((state) => state?.notifications)).then((state) => {
  console.log('Notification count:', state.notifications)
  // Update notification badge
})

// Simulate state changes
uiState$.next({
  user: { id: 1, name: 'Alice' },
  theme: 'light',
  notifications: 3,
})

uiState$.next({
  user: { id: 1, name: 'Alice' },
  theme: 'dark', // Theme changed
  notifications: 3,
})

uiState$.next({
  user: { id: 2, name: 'Bob' }, // User changed
  theme: 'dark',
  notifications: 5, // Notification count changed
})
```
