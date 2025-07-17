# merge

Merges the input [streams](/en/api/stream#stream) or [Observables](/en/api/observable), returning a new stream.

![image](/merge.drawio.svg)

## Type

```typescript
type merge: <T extends (Stream | Observable)[]>(...args$: T) => Stream<StreamTupleValues<T>[number]>;
```

## Details

- Stream merging operation refers to pushing data to the new stream in time order, as long as any input stream pushes data.
- The new stream will unsubscribe when all input streams are unsubscribed.
- The new stream will [finish](/en/guide/base#completion) when all input streams have finished.
- Only accepts `Stream` or `Observable` as input, other types will throw an error.
- If no input parameters are provided, creates an empty stream that won't emit any data.
- Already completed streams won't emit data to the merged stream, but will count towards completion.

## Example

```typescript
import { $, merge } from 'fluth'

const stream1$ = $(1)
const stream2$ = $('hello')
const stream3$ = $(true)

const merged$ = merge(stream1$, stream2$, stream3$)

merged$.then((value) => console.log(value))
console.log(merged$.value)
// prints: undefined

stream1$.next(2)
// prints: 2
stream2$.next('world')
// prints: world
stream3$.next(false)
// prints: false
stream1$.next(3)
// prints: 3
```

## Error Handling Example

```typescript
import { $, merge } from 'fluth'

const stream1$ = $()
const stream2$ = $()

const merged$ = merge(stream1$, stream2$)
merged$.then(
  (value) => console.log('success:', value),
  (error) => console.log('error:', error)
)

// Mix success and error emissions
stream1$.next(Promise.resolve('success-1'))
stream2$.next(Promise.reject('error-1'))
// prints: success: success-1
// prints: error: error-1

stream1$.next(Promise.reject('error-2'))
stream2$.next(Promise.resolve('success-2'), true)
// prints: error: error-2
// prints: success: success-2
```

## Input Validation Example

```typescript
import { $, merge } from 'fluth'

// Correct input
const stream1$ = $()
const observable1$ = stream1$.then((value) => value)
const merged1$ = merge(stream1$, observable1$) // works normally

// Invalid input will throw an exception
try {
  const merged2$ = merge('invalid' as any, stream1$)
} catch (error) {
  console.log(error.message)
  // prints: merge operator only accepts Stream or Observable as input
}
```

## Partial Unsubscribe Example

```typescript
import { $, merge } from 'fluth'

const stream1$ = $()
const stream2$ = $()
const stream3$ = $()

const merged$ = merge(stream1$, stream2$, stream3$)
merged$.afterUnsubscribe(() => console.log('merge unsubscribed'))

// Partial stream unsubscribe, merge won't unsubscribe
stream1$.unsubscribe()
stream2$.unsubscribe()

// Remaining streams can still work
stream3$.next('still-working')
// prints: still-working

// When all streams are unsubscribed, merge will unsubscribe
stream3$.unsubscribe()
// prints: merge unsubscribed
```
