# buffer

A buffering operator that collects data from the source stream into a buffer and outputs all buffered data at once when the trigger stream emits a value.

## Type Definition

```typescript
type buffer = <T>(
  trigger$: Stream | Observable,
  shouldAwait?: boolean
) => (observable$: Observable<T>) => Observable<T[]>
```

## Parameters

- `trigger$` (Stream | Observable): The trigger stream that activates the buffer operator to emit all buffered data
- `shouldAwait` (boolean, optional): Whether to wait for the stream's `pending` state to end, defaults to `true`

## Return Value

Returns a new `Observable` that collects data from the source stream into an array and emits the buffered data array only when the trigger is activated.

## Details

Core behaviors of the `buffer` operator:

- **Data collection**: Continuously collects resolved values from the source stream into an internal buffer
- **Trigger mechanism**: Only emits all data in the buffer when the trigger stream emits a value
- **Value filtering**: Only collects resolved values, ignoring rejected Promises
- **Buffer clearing**: Automatically clears the buffer after each emission, preparing to collect the next batch of data
- **Await mechanism**: When `shouldAwait` is `true`, waits for pending state resolution before emitting

## Usage Scenarios

### Scenario 1: Basic Data Buffering

```typescript
import { $, buffer } from 'fluth'

const source$ = $()
const trigger$ = $()

const buffered$ = source$.pipe(buffer(trigger$))

buffered$.then((values) => {
  console.log('Buffered data:', values)
})

// Push data to source stream, but won't emit immediately
source$.next(1)
source$.next(2)
source$.next(3)

// Only emits buffered data when trigger is activated
trigger$.next('trigger') // Output: Buffered data: [1, 2, 3]

// Continue pushing data
source$.next(4)
source$.next(5)

// Trigger output again
trigger$.next('trigger') // Output: Buffered data: [4, 5]
```

### Scenario 2: Empty Buffer Handling

```typescript
import { $, buffer } from 'fluth'

const source$ = $()
const trigger$ = $()

const buffered$ = source$.pipe(buffer(trigger$))

buffered$.then((values) => {
  console.log('Buffered data:', values)
})

// Trigger when there's no data
trigger$.next('trigger') // Output: Buffered data: []
```

### Scenario 3: Batch Data Processing

```typescript
import { $, buffer } from 'fluth'

const dataStream$ = $()
const batchTrigger$ = $()

const batchedData$ = dataStream$.pipe(buffer(batchTrigger$))

batchedData$.then((batch) => {
  console.log(`Processing ${batch.length} items:`, batch)
  // Batch process data
})

// Generate data rapidly
for (let i = 1; i <= 100; i++) {
  dataStream$.next(i)
}

// Process in batch
batchTrigger$.next('process') // Output: Processing 100 items: [1, 2, 3, ..., 100]
```

### Scenario 4: Waiting for Async Values

```typescript
import { $, buffer } from 'fluth'

const source$ = $()
const trigger$ = $()

// shouldAwait is true (default)
const buffered$ = source$.pipe(buffer(trigger$, true))

buffered$.then((values) => {
  console.log('Buffered data:', values)
})

// Send immediate values and async values
source$.next(1)
source$.next(2)

const slowPromise = new Promise((resolve) => {
  setTimeout(() => resolve('async result'), 1000)
})
source$.next(slowPromise)

// Trigger immediately, but will wait for async value resolution
trigger$.next('trigger')
// Output after 1 second: Buffered data: [1, 2, 'async result']
```

### Scenario 5: Not Waiting for Async Values

```typescript
import { $, buffer } from 'fluth'

const source$ = $()
const trigger$ = $()

// shouldAwait is false
const buffered$ = source$.pipe(buffer(trigger$, false))

buffered$.then((values) => {
  console.log('Buffered data:', values)
})

source$.next(1)
source$.next(2)

const slowPromise = new Promise((resolve) => {
  setTimeout(() => resolve('async result'), 1000)
})
source$.next(slowPromise)

// Trigger immediately, won't wait for async value resolution
trigger$.next('trigger') // Output: Buffered data: [1, 2, Promise] or [1, 2]
```

## Important Notes

1. **Rejected value handling**: The buffer operator ignores rejected Promises and won't add them to the buffer
2. **Trigger timing**: Only emits buffered data when the trigger stream emits
3. **Buffer clearing**: Automatically clears the buffer after each emission
4. **Empty buffer**: Emits an empty array if triggered when there's no data
5. **Completion handling**: When the trigger stream completes, the buffer operator also completes

## Relationship with Other Operators

- Difference from `audit`: `buffer` collects all values into an array, `audit` only emits the latest value
- Difference from `combine`: `buffer` collects historical values from a single stream, `combine` merges latest values from multiple streams
- Difference from `throttle`: `buffer` is based on external triggers, `throttle` is based on time intervals

## Complete Example

```typescript
import { $, buffer } from 'fluth'

// Create log collection system
const logStream$ = $()
const flushTrigger$ = $()

// Create log buffer
const logBuffer$ = logStream$.pipe(buffer(flushTrigger$))

logBuffer$.then((logs) => {
  console.log(`Batch writing ${logs.length} logs:`)
  logs.forEach((log, index) => {
    console.log(`${index + 1}. ${log}`)
  })
  // Batch write to file or database
})

// Generate logs
logStream$.next('User login')
logStream$.next('Visit homepage')
logStream$.next('Click button')
logStream$.next('Submit form')

// Periodically flush log buffer
flushTrigger$.next('flush')
// Output:
// Batch writing 4 logs:
// 1. User login
// 2. Visit homepage
// 3. Click button
// 4. Submit form

// Continue generating logs
logStream$.next('User logout')

// Flush again
flushTrigger$.next('flush')
// Output:
// Batch writing 1 logs:
// 1. User logout
```

## Error Handling Example

```typescript
import { $, buffer } from 'fluth'

const source$ = $()
const trigger$ = $()

const buffered$ = source$.pipe(buffer(trigger$))

buffered$.then((values) => {
  console.log('Buffered data:', values)
})

// Mix successful and failed values
source$.next('success1')
source$.next(Promise.reject('error1')) // Will be ignored
source$.next('success2')
source$.next(Promise.reject('error2')) // Will be ignored
source$.next('success3')

// When triggered, only includes successful values
trigger$.next('trigger') // Output: Buffered data: ['success1', 'success2', 'success3']
```

## High Performance Scenario

```typescript
import { $, buffer } from 'fluth'

const dataStream$ = $()
const trigger$ = $()

const buffered$ = dataStream$.pipe(buffer(trigger$))

buffered$.then((values) => {
  console.log(`Processing ${values.length} items`)
})

// High frequency data generation
const largeCount = 10000
for (let i = 0; i < largeCount; i++) {
  dataStream$.next(i)
}

// Process all data at once
trigger$.next('process') // Output: Processing 10000 items
```
