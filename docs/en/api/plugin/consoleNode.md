# consoleNode

Debugging plugin that outputs execution results at the current node, used for debugging and monitoring a single node.

## Type Definition

```typescript
consoleNode: (resolvePrefix?: string, rejectPrefix?: string) => {
  execute: ({ result }: { result: Promise<any> | any }) => any
}
```

## Parameters

- `resolvePrefix` (optional): Console prefix for success, default is `'resolve'`
- `rejectPrefix` (optional): Console prefix for failure, default is `'reject'`

## Details

- Only executes at the current node, does not propagate to child nodes
- Outputs the result immediately, regardless of whether there is a handler
- For `Promise` type results, waits for Promise resolution before outputting
- Returns the original `result` without modifying the data flow

## Examples

### Scenario 1: Basic debugging output

```typescript
import { $ } from 'fluth'

const stream$ = $().use(consoleNode())

stream$.next(1)
// Output: resolve 1

const promise = Promise.resolve(2)
stream$.next(promise)
// Output: resolve 2

stream$.next(3)
stream$.next(4)
// Output: resolve 3
// Output: resolve 4
```

### Scenario 2: Custom prefix

```typescript
import { $ } from 'fluth'

const stream$ = $().use(consoleNode('custom'))

stream$.next('test')
// Output: custom test

const promise = Promise.resolve('async-test')
stream$.next(promise)
// Output: custom async-test
```

### Scenario 3: Custom success and failure prefix

```typescript
import { $ } from 'fluth'

const stream$ = $().use(consoleNode('success', 'failure'))

// Test success
stream$.next('test-value')
// Output: success test-value

// Test failure
const rejectedPromise = Promise.reject(new Error('custom error'))
stream$.next(rejectedPromise)
// Output: failure Error: custom error
```

### Scenario 4: Combined with debounce operator

```typescript
import { $, debounce } from 'fluth'

const promise$ = $()
  .pipe(debounce(100))
  .use(consoleNode())
  .then((value) => console.log(value))

promise$.next(1)
promise$.next(2)
promise$.next(3)
promise$.next(4)
promise$.next(5)

// Immediate output (consoleNode is triggered on every next):
// resolve 1
// resolve 2
// resolve 3
// resolve 4
// resolve 5

// After 100ms (debounced result):
// resolve 5
// 5
```

### Scenario 5: Remove plugin

```typescript
import { $ } from 'fluth'

const plugin = consoleNode()
const stream$ = $().use(plugin)

stream$.next(1)
// Output: resolve 1

stream$.remove(plugin)
stream$.next(2)
// No output
```
