# consoleAll

Debugging plugin that outputs execution results on all nodes of the stream chain, used for debugging and monitoring data flow, can only be used on `Stream` nodes.

## Type Definition

```typescript
consoleAll: (resolvePrefix?: string, rejectPrefix?: string) => {
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

## Details

- Executes on all nodes of the stream chain, not just a single node
- Only outputs in the following cases:
  - Root node (`root=true`)
  - Nodes with success handler (`onfulfilled`)
  - Nodes with error handler (`onrejected`) and status is `REJECTED`
- For `Promise` type results, waits for Promise resolution before outputting
- Returns the original `result` without modifying the data flow

## Examples

### Scenario 1: Basic debugging output

```typescript
import { $ } from 'fluth'

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
import { $, debounce } from 'fluth'

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

### Scenario 5: Remove plugin

```typescript
import { $, consoleAll } from 'fluth'

const plugin = consoleAll()
const stream$ = $().use(plugin)

stream$.then((value) => value + 1)
stream$.next(1)
// Output: resolve 1, resolve 2

stream$.remove(plugin)
stream$.next(2)
// No output
```
