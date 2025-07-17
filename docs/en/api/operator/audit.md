# audit

Audit operator based on a trigger stream. Only emits the latest resolved value from the source stream when the trigger is activated.

## Type Definition

```typescript
type audit = <T>(
  trigger$: Stream | Observable,
  shouldAwait?: boolean
) => (observable$: Observable<T>) => Observable<T>
```

## Parameters

- `trigger$` (Stream | Observable): The trigger stream. When this stream emits a value, the audit operator emits the latest resolved value from the source stream.
- `shouldAwait` (boolean, optional): Whether to wait for the source stream's `pending` state to resolve. Defaults to `true`. If the source is `pending` when triggered, it will wait for resolution before emitting.

## Return Value

Returns a new `Observable` that only emits the latest resolved value from the source stream when the trigger is activated.

## Details

- Only emits the current value of the source stream when the trigger stream emits a value.
- Only emits resolved values, ignores rejected `Promise`s.
- If the source stream emits multiple values quickly, only the latest resolved value is emitted.
- When `shouldAwait` is `true`, if the source is `pending`, it waits for resolution before emitting.
- When the `trigger$` stream completes, the stream produced by `audit` also completes.

## Usage Scenarios

### Scenario 1: Basic trigger emission

```typescript
import { $, audit } from 'fluth'

const source$ = $()
const trigger$ = $()

const audited$ = source$.pipe(audit(trigger$))

audited$.then((value) => {
  console.log('audited:', value)
})

// Set values on the source stream, but they are not emitted immediately
source$.next(1)
source$.next(2)
source$.next(3)

// Only emits the latest value when the trigger is activated
trigger$.next('trigger') // Output: audited: 3
```

### Scenario 2: Handling rapidly changing data

```typescript
import { $, audit } from 'fluth'

const searchInput$ = $()
const searchTrigger$ = $()

const searchResults$ = searchInput$.pipe(audit(searchTrigger$))

searchResults$.then((keyword) => {
  console.log('Search keyword:', keyword)
})

// User types quickly
searchInput$.next('a')
searchInput$.next('ap')
searchInput$.next('app')
searchInput$.next('apple')

// Only emits the latest search keyword when triggered
searchTrigger$.next('search') // Output: Search keyword: apple
```

### Scenario 3: Awaiting asynchronous values

```typescript
import { $, audit } from 'fluth'

const source$ = $()
const trigger$ = $()

// shouldAwait is true (default)
const audited$ = source$.pipe(audit(trigger$, true))

audited$.then((value) => {
  console.log('audited:', value)
})

// Send a Promise that resolves after some time
const slowPromise = new Promise((resolve) => {
  setTimeout(() => resolve('async result'), 1000)
})
source$.next(slowPromise)

// Trigger immediately, but will wait for the Promise to resolve
trigger$.next('trigger')
// After 1 second: Output: audited: async result
```

### Scenario 4: Not awaiting asynchronous values

```typescript
import { $, audit } from 'fluth'

const source$ = $()
const trigger$ = $()

// shouldAwait is false
const audited$ = source$.pipe(audit(trigger$, false))

audited$.then((value) => {
  console.log('audited:', value)
})

const slowPromise = new Promise((resolve) => {
  setTimeout(() => resolve('async result'), 1000)
})
source$.next(slowPromise)

// Trigger immediately, does not wait for the Promise to resolve
trigger$.next('trigger') // Output: audited: undefined
```
