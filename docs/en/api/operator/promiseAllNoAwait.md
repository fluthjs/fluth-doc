# promiseAllNoAwait

Combines input [streams](/en/api/stream#stream) or [Observables](/en/api/observable), similar to Promise.all behavior, but does not wait for pending promises during status reset, which can improve performance

## Type

```typescript
type promiseAllNoAwait: <T extends (Stream | Observable)[]>(...args$: T) => Stream<StreamTupleValues<T>>;
```

## Details

- The new stream will only emit its first data after all input streams have emitted their first data
- The new stream will only emit new data when and only when all input streams push new data
- After all input streams [finish](/en/guide/base#completion), the new stream will also finish
- After all input streams unsubscribe, the new stream will also unsubscribe
- If any input stream is rejected, the output stream will emit a rejected Promise with the respective values
- **Key difference from `promiseAll`**: Does not wait for pending promises during status reset, which can improve performance
- Internal Promise status is reset after each emission, but does not wait for promises still in pending state

## Example

### Basic Usage

```typescript
import { $, promiseAllNoAwait } from 'fluth'

const stream1$ = $(1)
const stream2$ = $('hello')
const stream3$ = $(true)

const promiseAll$ = promiseAllNoAwait(stream1$, stream2$, stream3$)

promiseAll$.then((value) => console.log(value))
console.log(promiseAll$.value)
// prints: undefined

stream1$.next(2)
stream2$.next('world')
stream3$.next(false)
// prints: [2, "world", false]

stream1$.next(3)
stream1$.next(4)
stream3$.next(true)
stream2$.next('new')
// prints: [4, "new", true]
```

### Performance Comparison with promiseAll

```typescript
import { $, promiseAll, promiseAllNoAwait } from 'fluth'

const stream1$ = $()
const stream2$ = $()

// Standard version
const awaitResult$ = promiseAll(stream1$, stream2$)
awaitResult$.then((values) => console.log('await version:', values))

// No-await version
const noAwaitResult$ = promiseAllNoAwait(stream1$, stream2$)
noAwaitResult$.then((values) => console.log('no-await version:', values))

// Set streams to pending state
stream1$.next(new Promise((resolve) => setTimeout(() => resolve('delayed1'), 100)))
stream2$.next(new Promise((resolve) => setTimeout(() => resolve('delayed2'), 50)))

// After 60ms, stream2's Promise has resolved, but stream1 is still pending
setTimeout(() => {
  // Send new immediate values
  stream1$.next('immediate1')
  stream2$.next('immediate2')

  // promiseAllNoAwait will immediately process new values, not waiting for previous pending Promise
  // prints: no-await version: ['immediate1', 'immediate2']

  // promiseAll will wait for all pending Promises to resolve
  // Won't print until 100ms later
}, 60)
```

### Error Handling Example

```typescript
import { $, promiseAllNoAwait } from 'fluth'

const stream1$ = $()
const stream2$ = $()

const promiseAll$ = promiseAllNoAwait(stream1$, stream2$)
promiseAll$.then(
  (values) => console.log('success:', values),
  (errors) => console.log('error:', errors)
)

// Mix success and failure values
stream1$.next('success')
stream2$.next(Promise.reject('failure'))
// Promise operations are async
await sleep(1)
// prints: error: ['success', 'failure']

// New values after reset
stream1$.next('success2')
stream2$.next('success2')
// prints: success: ['success2', 'success2']
```

### High Performance Scenario Example

```typescript
import { $, promiseAllNoAwait } from 'fluth'

const stream1$ = $()
const stream2$ = $()
const stream3$ = $()

const result$ = promiseAllNoAwait(stream1$, stream2$, stream3$)
result$.then((values) => console.log('high-performance processing:', values))

// Simulate high-frequency data streams
let counter = 0
const interval = setInterval(() => {
  // Mix sync and async data
  stream1$.next(`sync-${counter}`)
  stream2$.next(
    new Promise((resolve) => setTimeout(() => resolve(`async-${counter}`), Math.random() * 100))
  )
  stream3$.next(`immediate-${counter}`)

  counter++
  if (counter >= 5) {
    clearInterval(interval)
  }
}, 20)

// promiseAllNoAwait will process new data faster, not blocked by slow async operations
```

### Status Reset Behavior Comparison

```typescript
import { $, promiseAll, promiseAllNoAwait } from 'fluth'

const stream1$ = $()
const stream2$ = $()

const await$ = promiseAll(stream1$, stream2$)
const noAwait$ = promiseAllNoAwait(stream1$, stream2$)

await$.then((values) => console.log('await version:', values))
noAwait$.then((values) => console.log('no-await version:', values))

// First: send slow async Promise
stream1$.next(new Promise((resolve) => setTimeout(() => resolve('slow1'), 200)))
stream2$.next('fast1')

// After 50ms: send new data
setTimeout(() => {
  stream1$.next('new-fast1')
  stream2$.next('new-fast2')

  // noAwait version will immediately emit new data
  // await version will wait for the first slow Promise to complete
}, 50)

// Results:
// no-await version: ['new-fast1', 'new-fast2'] (at 50ms)
// await version: ['new-fast1', 'new-fast2'] (at 200ms)
```

### Real-world Application Scenario

```typescript
import { $, promiseAllNoAwait } from 'fluth'

// Real-time data monitoring scenario
const cpuUsage$ = $() // CPU usage
const memoryUsage$ = $() // Memory usage
const networkSpeed$ = $() // Network speed

const systemStats$ = promiseAllNoAwait(cpuUsage$, memoryUsage$, networkSpeed$)
systemStats$.then(([cpu, memory, network]) => {
  console.log(`System Status - CPU: ${cpu}%, Memory: ${memory}%, Network: ${network}Mbps`)
})

// Simulate different frequency data updates
setInterval(() => cpuUsage$.next(Math.random() * 100), 100) // every 100ms
setInterval(() => memoryUsage$.next(Math.random() * 100), 150) // every 150ms
setInterval(() => networkSpeed$.next(Math.random() * 1000), 200) // every 200ms

// promiseAllNoAwait ensures that even if some data sources have delays,
// it won't block the overall update frequency
```

## Usage Guidelines

### When to Use promiseAllNoAwait

- **High-frequency data streams**: When you need to handle high-frequency data updates
- **Performance-sensitive applications**: When response speed is more important than data consistency
- **Real-time monitoring systems**: When you need the latest data state, even if some data sources have delays
- **Frequent async operations**: When input streams frequently contain async Promises

### When to Use Standard promiseAll

- **Data consistency is important**: When you need to ensure all data is from the same time point
- **Batch processing scenarios**: When you need to wait for all async operations to complete before processing
- **State synchronization requirements**: When you need strict state synchronization
