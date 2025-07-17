# concat

Combines input [streams](/en/api/stream#stream) or [observables](/en/api/observable) in sequence, returning a new stream.

![image](/concat.drawio.svg)

## Type

```typescript
type concat: <T extends (Stream | Observable)[]>(...args$: T) => Stream<StreamTupleValues<T>[number]>;
```

## Parameters

- `...args$`: Multiple [Stream](/en/api/stream#stream) or [Observable](/en/api/observable) instances

## Details

- Data from the next input stream will only be pushed to the new stream after the current input stream has [finished](/en/guide/base#completion).
- Only one input stream's data will be emitted at a time, other streams' data will be ignored until it's their turn.
- The new stream will also unsubscribe when the current input stream unsubscribes.
- The new stream will [finish](/en/guide/base#completion) when all input streams have finished.
- Only accepts `Stream` or `Observable` as input, other types will throw an error.
- If no input parameters are provided, it will complete immediately.

## Example

```typescript
import { $, concat } from 'fluth'

const stream1$ = $(1)
const stream2$ = $('hello')

const concat$ = concat(stream1$, stream2$)
concat$.then((value) => console.log(value))
console.log(concat$.value)
// prints: undefined

stream1$.next(2)
// prints: 2
stream2$.next('world')
stream1$.next(3, true)
// prints: 3
stream2$.next('word')
// prints: word
```

## Sequential emission example

```typescript
import { $, concat } from 'fluth'

const stream1$ = $()
const stream2$ = $()
const stream3$ = $()

const concat$ = concat(stream1$, stream2$, stream3$)
concat$.then((value) => console.log('output:', value))

// First stream emits data
stream1$.next('a')
// prints: output: a

stream1$.next('b')
// prints: output: b

// Second stream emits data, but won't be output (first stream not completed)
stream2$.next('c') // This data will be ignored

// First stream completes
stream1$.next('final1', true)
// prints: output: final1

// Now second stream can emit data
stream2$.next('d', true)
// prints: output: d

// Third stream starts emitting data
stream3$.next('e', true)
// prints: output: e
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
