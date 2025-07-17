# concat

Concatenates the input [stream](/en/api/stream#stream) or [observable](/en/api/observable) in order and returns a new stream.

![image](/concat.drawio.svg)

## Type

```typescript
type concat: <T extends (Stream | Observable)[]>(...args$: T) => Stream<StreamTupleValues<T>[number]>;
```

## Parameters

- `...args$`: Multiple [Stream](/en/api/stream#stream) or [Observable](/en/api/observable) instances

## Details

- Only after the current input stream [completes](/en/guide/base#complete), the next input stream's data will be emitted to the new stream
- When all input streams unsubscribe, the new stream also unsubscribes
- At any time, only one input stream's data will be emitted; data from other streams will be ignored until their turn
- After all input streams [complete](/en/guide/base#complete), the new stream also completes
- If no input parameters are provided, an empty stream is created but will not emit any data

## Examples

```typescript
import { $, concat } from 'fluth'

const stream1$ = $()
const stream2$ = $()
const stream3$ = $()

const concat$ = concat(stream1$, stream2$, stream3$)
concat$.then((value) => console.log('Output:', value))

// The first stream emits data
stream1$.next('a')
// Output: a

stream1$.next('b')
// Output: b

// The second stream emits data, but will not be output (the first stream is not finished)
stream2$.next('c') // This data will be ignored

// The first stream completes
stream1$.next('final1', true)
// Output: final1

// Now the second stream can emit data
stream2$.next('d', true)
// Output: d

// The third stream starts emitting data
stream3$.next('e', true)
// Output: e
```

## Error handling example

```typescript
import { $, concat } from 'fluth'

const stream1$ = $()
const stream2$ = $()

const concat$ = concat(stream1$, stream2$)
concat$.then(
  (value) => console.log('success:', value),
  (error) => console.log('error:', error)
)

// First stream emits normally then errors
stream1$.next('success1')
// prints: success: success1

stream1$.next(Promise.reject('error1'), true)
// prints: error: error1

// Second stream can still emit data (even if first stream errored)
stream2$.next('success2', true)
// prints: success: success2
```

## Input validation example

```typescript
import { $, concat } from 'fluth'

// Correct input
const stream1$ = $()
const observable1$ = stream1$.then((value) => value)
const concat1$ = concat(stream1$, observable1$) // Works fine

// Invalid input will throw an exception
try {
  const concat2$ = concat('invalid' as any, stream1$)
} catch (error) {
  console.log(error.message)
  // prints: concat operator only accepts Stream or Observable as input
}
```

## Empty input handling example

```typescript
import { $, concat } from 'fluth'

// Handle empty input
const emptyConcat$ = concat()
emptyConcat$.afterComplete(() => console.log('empty input completed'))

// Empty input will complete immediately
// prints: empty input completed
```

## Unsubscription behavior example

```typescript
import { $, concat } from 'fluth'

const stream1$ = $()
const stream2$ = $()
const stream3$ = $()

const concat$ = concat(stream1$, stream2$, stream3$)
concat$.afterUnsubscribe(() => console.log('concat unsubscribed'))

// First stream emits data
stream1$.next('test')

// Unsubscribe the first stream (currently active stream)
stream1$.unsubscribe()
// prints: concat unsubscribed

// Or when future streams unsubscribe
const concat2$ = concat(stream1$, stream2$, stream3$)
stream3$.unsubscribe() // Future stream unsubscribes
stream1$.next('data', true) // When first stream completes
stream2$.next('data', true) // When second stream completes
// concat2$ will unsubscribe
```
