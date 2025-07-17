# promiseRace

The input [streams](/en/api/stream#stream) or [Observables](/en/api/observable) compete, returning a new stream, similar to `Promise.race` behavior

![image](/promiseRace.drawio.svg)

## Type

```typescript
type promiseRace: <T extends (Stream | Observable)[]>(...args$: T) => Stream<StreamTupleValues<T>[number]>;
```

## Details

- Only the first stream to emit data becomes the "winner", and subsequently only this winning stream's data will be forwarded to the output stream
- Other streams' data will be ignored, even if they continue to emit data
- When the winning stream unsubscribes, the output stream will also unsubscribe
- When the winning stream [finishes](/en/guide/base#completion), the output stream will also finish
- Supports error handling: if the winning stream emits a rejected `Promise`, the output stream will also emit a rejected `Promise`

## Example

### Basic Usage

```typescript
import { $, promiseRace } from 'fluth'

const stream1$ = $(1)
const stream2$ = $('hello')
const stream3$ = $(false)

const promiseRace$ = promiseRace(stream1$, stream2$, stream3$)
promiseRace$.then((value) => console.log(value))

stream2$.next('world')
// prints: hello (initial value)
stream3$.next(true)
stream1$.next(3)
stream2$.next('code')
// prints: code (only stream2's subsequent data will be forwarded)
```

### Winner Competition Example

```typescript
import { $, promiseRace } from 'fluth'

const stream1$ = $()
const stream2$ = $()
const stream3$ = $()

const race$ = promiseRace(stream1$, stream2$, stream3$)
race$.then((value) => console.log('winner:', value))

// Second stream emits first
stream2$.next('second wins')
// prints: winner: second wins

// Other streams' data will be ignored
stream1$.next('first too late')
stream3$.next('third too late')
// no output

// Only the winning stream's subsequent emissions will be processed
stream2$.next('second again')
// prints: winner: second again
```

### Error Handling Example

```typescript
import { $, promiseRace } from 'fluth'

const stream1$ = $()
const stream2$ = $()

const race$ = promiseRace(stream1$, stream2$)
race$.then(
  (value) => console.log('success:', value),
  (error) => console.log('error:', error)
)

// First stream rejects first
stream1$.next(Promise.reject('first error'))
// prints: error: first error

// Second stream's data will be ignored
stream2$.next('second value')
// no output, because first stream already won

// First stream's subsequent errors will also be forwarded
stream1$.next(Promise.reject('first error again'))
// prints: error: first error again
```

### Unsubscribe Behavior Example

```typescript
import { $, promiseRace } from 'fluth'

const stream1$ = $()
const stream2$ = $()
const stream3$ = $()

const race$ = promiseRace(stream1$, stream2$, stream3$)
race$.afterUnsubscribe(() => console.log('race unsubscribed'))

// Establish winner
stream1$.next('first wins')

// Winning stream unsubscribe causes race stream to unsubscribe
stream1$.unsubscribe()
// prints: race unsubscribed

// Other streams' unsubscription won't affect race stream (if they didn't win)
```

### Async Competition Example

```typescript
import { $, promiseRace } from 'fluth'

const fastStream$ = $()
const slowStream$ = $()

const race$ = promiseRace(fastStream$, slowStream$)
race$.then((value) => console.log('async race:', value))

// Send async Promises with different speeds
fastStream$.next(new Promise((resolve) => setTimeout(() => resolve('fast'), 50)))
slowStream$.next(new Promise((resolve) => setTimeout(() => resolve('slow'), 100)))

// After 50ms prints: async race: fast
// slowStream's Promise will be ignored even if it resolves later

// Subsequently only fast stream's data will be processed
setTimeout(() => {
  fastStream$.next('fast stream new data')
  // prints: async race: fast stream new data

  slowStream$.next('slow stream data')
  // no output, because fast stream already won
}, 200)
```

### Completion State Propagation Example

```typescript
import { $, promiseRace } from 'fluth'

const stream1$ = $()
const stream2$ = $()

const race$ = promiseRace(stream1$, stream2$)
race$.afterComplete(() => console.log('race completed'))

// Establish winner
stream1$.next('winner')

// When winning stream completes, race stream also completes
stream1$.next('final value', true)
// prints: race completed

// Other streams' completion won't affect race stream (if they didn't win)
stream2$.next('other stream', true) // won't affect race stream
```
