# consoleAll

Debugging plugin that outputs execution results on all nodes of the stream chain, used for debugging and monitoring data flow, can only be used on `Stream` nodes.

## Type Definition

```typescript
consoleAll: (resolvePrefix?: string, rejectPrefix?: string, ignoreUndefined?: boolean) => {
  executeAll: ({
    result,
    status,
    onfulfilled,
    onrejected,
    root,
  }: {
    result: Promise<any> | any
    status: PromiseStatus | null
    onfulfilled?: OnFulfilled
    onrejected?: OnRejected
    root: boolean
  }) => any
}
```

## Parameters

- `resolvePrefix` (optional): Console prefix for success, default is `'resolve'`
- `rejectPrefix` (optional): Console prefix for failure, default is `'reject'`
- `ignoreUndefined` (optional): Whether to ignore `undefined` values output, default is `true`

## Details

- Executes on all nodes of the stream chain, not just a single node
- Only outputs in the following cases:
  - Root node (`root=true`)
  - Nodes with success handler (`onfulfilled`)
  - Nodes with error handler (`onrejected`) and status is `REJECTED`
- For `Promise` type results, waits for Promise resolution before outputting
- By default ignores `undefined` values output (`ignoreUndefined=true`), can be controlled by the third parameter
- Returns the original `result` without modifying the data flow

## Examples

### Scenario 1: Basic debugging output

```typescript
import { $ } from 'fluth'
import { consoleAll } from 'fluth'

const stream$ = $().use(consoleAll())

stream$.next(1)
// Output: resolve 1

const promise = Promise.resolve(2)
stream$.next(promise)
// Output: resolve 2
```

### Scenario 2: Stream chain debugging output

```typescript
import { $ } from 'fluth'
import { consoleAll } from 'fluth'

const promise$ = $().use(consoleAll())

promise$.then((value) => value + 1).then((value) => value + 1)

promise$.next(1)
// Output:
// resolve 1
// resolve 2
// resolve 3
```

### Scenario 3: Custom prefix debugging output

```typescript
import { $ } from 'fluth'
import { consoleAll } from 'fluth'

// Custom prefix
const promise$ = $().use(consoleAll('success', 'failure'))

promise$.then((value) => value + 1)

promise$.next(1)
// Output:
// success 1
// success 2

const rejectedPromise = Promise.reject(new Error('error'))
promise$.next(rejectedPromise)
// Output: failure Error: error
```

### Scenario 4: Combined with operators debugging output

```typescript
import { $ } from 'fluth'
import { consoleAll, debounce } from 'fluth'

const promise$ = $()
  .use(consoleAll())
  .pipe(debounce(100))
  .then((value) => value + 1)

promise$.next(1)
promise$.next(2)
promise$.next(3)
promise$.next(4)
promise$.next(5)
// Output:
// resolve 1
// resolve 2
// resolve 3
// resolve 4
// resolve 5
// After 100ms: resolve 6
```

### Scenario 5: `undefined` value handling

```typescript
import { $ } from 'fluth'
import { consoleAll } from 'fluth'

// Default ignores undefined values
const stream1$ = $().use(consoleAll())
stream1$.next(undefined) // No output
stream1$.next(null) // Output: resolve null
stream1$.next(0) // Output: resolve 0
stream1$.next('') // Output: resolve ""
stream1$.next(false) // Output: resolve false

// Don't ignore undefined values
const stream2$ = $().use(consoleAll('resolve', 'reject', false))
stream2$.next(undefined) // Output: resolve undefined
```

### Scenario 6: Edge case handling

```typescript
import { $ } from 'fluth'
import { consoleAll } from 'fluth'

const stream$ = $().use(consoleAll())

// Test various edge values
stream$.next(null) // Output: resolve null
stream$.next(0) // Output: resolve 0
stream$.next('') // Output: resolve ""
stream$.next(false) // Output: resolve false
stream$.next(undefined) // No output (ignored by default)

// Promise edge cases
const resolveUndefined = Promise.resolve(undefined)
stream$.next(resolveUndefined) // No output (undefined ignored)

const rejectUndefined = Promise.reject(undefined)
stream$.next(rejectUndefined) // No output (undefined ignored)
```

### Scenario 7: Remove plugin

```typescript
import { $ } from 'fluth'
import { consoleAll } from 'fluth'

const plugin = consoleAll()
const stream$ = $().use(plugin)

stream$.then((value) => value + 1)
stream$.next(1)
// Output: resolve 1, resolve 2

stream$.remove(plugin)
stream$.next(2)
// No output
```
