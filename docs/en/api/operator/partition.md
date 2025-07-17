# partition

Partitions the input [stream](/en/api/stream#stream) or [Observable](/en/api/observable) based on a predicate function, returning two streams: the first stream contains values that satisfy the condition, and the second stream contains values that do not satisfy the condition.

![image](/partition.drawio.svg)

## Type

```typescript
type partition: <T>(
  stream$: Stream<T> | Observable<T>,
  predicate: (this: any, value: any, status: 'resolved' | 'rejected', index: number) => boolean,
  thisArg?: any,
) => [Stream<T>, Stream<T>];
```

## Parameters

- `stream$` (Stream | Observable): Input stream or Observable
- `predicate` (Function): Predicate function that receives `value`, `status`, and `index` parameters
  - `value`: Current value
  - `status`: Promise status ('resolved' or 'rejected')
  - `index`: Index counter starting from 1
- `thisArg` (optional): The `this` context for the predicate function

## Return Value

Returns an array containing two Streams: `[stream for satisfied conditions, stream for unsatisfied conditions]`

## Details

- Divides the input stream based on the predicate function, returning two streams: the first stream contains values that satisfy the condition, and the second stream contains values that do not satisfy the condition.
- When the input stream unsubscribes, both returned streams will also unsubscribe.
- When the input stream [finishes](/en/guide/base#completion), the corresponding returned streams will also finish.
- Only accepts `Stream` or `Observable` as input, other types will throw an error.
- If the input stream is already completed, both returned streams will complete immediately.
- When the predicate function throws an error, the value will be assigned to the unsatisfied conditions stream.
- Index counter starts from 1 and increments after each value is processed.

## Example

```typescript
import { $, partition } from 'fluth'

const stream$ = $(0)

const [evenStream$, oddStream$] = partition(stream$, (value) => value % 2 === 0)

evenStream$.then((value) => console.log('even stream', value))
oddStream$.then((value) => console.log('odd stream', value))

stream$.next(1)
// prints: odd stream 1
stream$.next(2)
// prints: even stream 2
stream$.next(3)
// prints: odd stream 3
stream$.next(4)
// prints: even stream 4
```

## Status-based Partitioning Example

```typescript
import { $, partition } from 'fluth'

const stream$ = $()

const [selectedStream$, unselectedStream$] = partition(stream$, (value, status) => {
  // Select resolved odd numbers or rejected even numbers
  if (status === 'resolved') {
    return value % 2 === 1
  } else {
    return value % 2 === 0
  }
})

selectedStream$.then(
  (value) => console.log('selected success:', value),
  (value) => console.log('selected error:', value)
)
unselectedStream$.then(
  (value) => console.log('unselected success:', value),
  (value) => console.log('unselected error:', value)
)

stream$.next('1') // resolved odd -> selected
// prints: selected success: 1
stream$.next('2') // resolved even -> unselected
// prints: unselected success: 2
stream$.next(Promise.reject('3')) // rejected odd -> unselected
// prints: unselected error: 3
stream$.next(Promise.reject('4')) // rejected even -> selected
// prints: selected error: 4
```

## Index-based Partitioning Example

```typescript
import { $, partition } from 'fluth'

const stream$ = $()

const [oddIndexStream$, evenIndexStream$] = partition(stream$, (value, status, index) => {
  return index % 2 === 1 // Select items at odd indices
})

oddIndexStream$.then((value) => console.log('odd index:', value))
evenIndexStream$.then((value) => console.log('even index:', value))

stream$.next('a') // index 1
// prints: odd index: a
stream$.next('b') // index 2
// prints: even index: b
stream$.next('c') // index 3
// prints: odd index: c
```

## Using thisArg Example

```typescript
import { $, partition } from 'fluth'

const stream$ = $()

const context = {
  threshold: 3,
  checkLength: function (value: string) {
    return value.length > this.threshold
  },
}

const [longStrings$, shortStrings$] = partition(
  stream$,
  function (value, status, index) {
    return this.checkLength(value)
  },
  context
)

longStrings$.then((value) => console.log('long string:', value))
shortStrings$.then((value) => console.log('short string:', value))

stream$.next('hi')
// prints: short string: hi
stream$.next('hello')
// prints: long string: hello
```

## Error Handling Example

```typescript
import { $, partition } from 'fluth'

const stream$ = $()

const [selected$, unselected$] = partition(stream$, (value, status, index) => {
  if (value === 'error') {
    throw new Error('Predicate error')
  }
  return value % 2 === 1
})

selected$.then((value) => console.log('selected:', value))
unselected$.then((value) => console.log('unselected:', value))

stream$.next(1)
// prints: selected: 1
stream$.next('error') // Predicate throws error, value goes to unselected stream
// prints: unselected: error
```

## Input Validation Example

```typescript
import { $, partition } from 'fluth'

// Correct input
const stream$ = $()
const [stream1$, stream2$] = partition(stream$, (value) => value > 0) // works normally

// Invalid input will throw an exception
try {
  const [error1$, error2$] = partition('invalid' as any, (value) => true)
} catch (error) {
  console.log(error.message)
  // prints: partition operator only accepts Stream or Observable as input
}
```
