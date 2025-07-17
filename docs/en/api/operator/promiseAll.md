# promiseAll

Combines input [streams](/en/api/stream#stream) or [Observables](/en/api/observable), similar to Promise.all behavior, returning a new stream

![image](/promiseAll.drawio.svg)

## Type

```typescript
type promiseAll: <T extends (Stream | Observable)[]>(...args$: T) => Stream<StreamTupleValues<T>>;
type promiseAllNoAwait: <T extends (Stream | Observable)[]>(...args$: T) => Stream<StreamTupleValues<T>>;
```

## Details

- The new stream will only emit its first data after all input streams have emitted their first data
- The new stream will only emit new data when and only when all input streams push new data
- After all input streams [finish](/en/guide/base#completion), the new stream will also finish
- After all input streams unsubscribe, the new stream will also unsubscribe
- If any input stream is rejected, the output stream will emit a rejected Promise with the respective values
- When input streams are in `pending` status, the output stream will also be in `pending` status
- Internal Promise status is reset after each emission
- `promiseAllNoAwait` variant does not wait for pending promises during status reset, which can improve performance

## Example

```typescript
import { $, promiseAll } from 'fluth'

const stream1$ = $(1)
const stream2$ = $('hello')
const stream3$ = $(true)

const promiseAll$ = promiseAll(stream1$, stream2$, stream3$)

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

## Error Handling Example

```typescript
import { $, promiseAll } from 'fluth'

const stream1$ = $()
const stream2$ = $()

const promiseAll$ = promiseAll(stream1$, stream2$)
promiseAll$.then(
  (values) => console.log('success:', values),
  (errors) => console.log('error:', errors)
)

// Mix success and failure values
stream1$.next('success')
stream2$.next(Promise.reject('failure'))
// prints: error: ['success', 'failure']

// New values after reset
stream1$.next('success2')
stream2$.next('success2')
// prints: success: ['success2', 'success2']
```

## Async Processing Example

```typescript
import { $, promiseAll } from 'fluth'

const stream1$ = $()
const stream2$ = $()

const promiseAll$ = promiseAll(stream1$, stream2$)
promiseAll$.then((values) => console.log('async result:', values))

// Send async Promise
stream1$.next(new Promise((resolve) => setTimeout(() => resolve('async value1'), 100)))
stream2$.next('sync value')

// Will emit only after async value resolves
// prints: async result: ['async value1', 'sync value']
```

## Status Management Example

```typescript
import { $, promiseAll } from 'fluth'

const stream1$ = $()
const stream2$ = $()

const promiseAll$ = promiseAll(stream1$, stream2$)
promiseAll$.then((values) => console.log('status management:', values))

// Send pending Promise
let resolvePending: (value: string) => void
const pendingPromise = new Promise<string>((resolve) => {
  resolvePending = resolve
})

stream1$.next(pendingPromise)
stream2$.next('immediate value')

console.log('status:', promiseAll$.status) // 'pending'

// Resolve Promise later
setTimeout(() => {
  resolvePending!('resolved value')
  // prints: status management: ['resolved value', 'immediate value']
}, 100)
```

## promiseAllNoAwait Example

```typescript
import { $, promiseAllNoAwait } from 'fluth'

const stream1$ = $()
const stream2$ = $()

const promiseAll$ = promiseAllNoAwait(stream1$, stream2$)
promiseAll$.then((values) => console.log('no await:', values))

// Set streams to pending state
stream1$.next(new Promise((resolve) => setTimeout(() => resolve('delayed1'), 100)))
stream2$.next(new Promise((resolve) => setTimeout(() => resolve('delayed2'), 50)))

// After 50ms, stream2's Promise resolves
setTimeout(() => {
  // Send new immediate value, don't wait for stream1's pending Promise
  stream1$.next('immediate1')
  // prints: no await: ['immediate1', 'delayed2']
}, 60)
```

## Large Stream Count Example

```typescript
import { $, promiseAll } from 'fluth'

// Create 10 streams
const streams = Array.from({ length: 10 }, (_, i) => $(i))
const promiseAll$ = promiseAll(...streams)

promiseAll$.then((values) => console.log('large count:', values.length, values))

// Send new values to all streams
streams.forEach((stream$, index) => {
  stream$.next(`value${index}`)
})
// prints: large count: 10 ['value0', 'value1', ..., 'value9']
```
