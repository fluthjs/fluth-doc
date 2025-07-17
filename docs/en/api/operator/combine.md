# combine

Combines input [streams](/en/api/stream#stream) or [observables](/en/api/observable) and returns a new stream.

![image](/combine.drawio.svg)

## Type

```typescript
type combine: <T extends (Stream | Observable)[]>(...args$: T) => Stream<StreamTupleValues<T>>;
```

## Parameters

- `...args$`: Multiple [Stream](/en/api/stream#stream) or [Observable](/en/api/observable) instances

## Details

- The new stream will only emit its first data after all input streams have emitted their first data.
- When any input stream emits new data, the new stream will emit an array containing the latest values from all streams.
- If any input stream emits an error value, the new stream will emit a rejected array containing the error value.
- The new stream will unsubscribe when all input streams are unsubscribed.
- The new stream will [finish](/en/guide/base#completion) when all input streams have finished.
- If all input streams are already finished at the start, the output stream will [finish](/en/guide/base#completion).
- Only accepts `Stream` or `Observable` as input, other types will throw an error.
- Supports already completed input streams, using their final values in the combination.

## Example

```typescript
import { $, combine } from 'fluth'

const stream1$ = $(1)
const stream2$ = $('hello')
const stream3$ = $(true)

const combined$ = combine(stream1$, stream2$, stream3$)
combined$.then((value) => console.log(value))
console.log(combined$.value)
// prints: undefined

stream1$.next(2)
stream2$.next('world')
stream3$.next(false)
// prints: [2, "world", false]

stream1$.next(3)
// prints: [3, "world", false]

stream3$.next(true)
// prints: [3, "world", true]
```

## Error handling example

```typescript
import { $, combine } from 'fluth'

const stream1$ = $()
const stream2$ = $()
const stream3$ = $()

const combined$ = combine(stream1$, stream2$, stream3$)
combined$.then(
  (value) => console.log('resolve', value),
  (value) => console.log('reject', value)
)

// Simulate API calls
stream1$.next(Promise.resolve('data1'))
stream2$.next(Promise.reject('error'))
stream3$.next(Promise.resolve('data3'))
// prints: reject ["data1", "error", "data3"]
```

## Unsubscription example

```typescript
import { $, combine } from 'fluth'

const stream1$ = $()
const stream2$ = $()
const stream3$ = $()

const combined$ = combine(stream1$, stream2$, stream3$)
combined$.afterUnsubscribe(() => console.log('combined stream unsubscribed'))

// When all input streams unsubscribe, the combined stream also unsubscribes
stream1$.unsubscribe()
stream2$.unsubscribe()
stream3$.unsubscribe()
// prints: combined stream unsubscribed
```

## Input validation example

```typescript
import { $, combine } from 'fluth'

// Correct input
const stream1$ = $()
const observable1$ = stream1$.then((value) => value)
const combined1$ = combine(stream1$, observable1$) // Works fine

// Invalid input will throw an exception
try {
  const combined2$ = combine('invalid' as any, stream1$)
} catch (error) {
  console.log(error.message)
  // prints: combine operator only accepts Stream or Observable as input
}
```

## Completed stream handling example

```typescript
import { $, combine } from 'fluth'

const stream1$ = $()
const stream2$ = $()
const stream3$ = $()

// Complete some streams in advance
stream1$.next('completed1', true)
stream2$.next('completed2', true)

const combined$ = combine(stream1$, stream2$, stream3$)
combined$.then((value) => console.log('result:', value))

// Complete the remaining stream
stream3$.next('active3', true)
// prints: result: ["completed1", "completed2", "active3"]
```

## Empty input handling example

```typescript
import { $, combine } from 'fluth'

// Handle empty input
const emptyCombined$ = combine()
emptyCombined$.then((value) => console.log('empty input result:', value))

// Stream with empty input won't complete or emit data immediately
console.log(emptyCombined$.value) // prints: undefined
```
