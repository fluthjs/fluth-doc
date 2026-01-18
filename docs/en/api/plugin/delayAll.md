# delayAll

A delay execution plugin that delays the processing result for a specified time before pushing it to child nodes at all nodes in the stream chain. Can only be used on `Stream` nodes.

## Type Definition

```typescript
delayAll: (delayTime: number) => {
  executeAll: ({
    result,
    status,
    onfulfilled,
    onrejected,
    root,
  }: {
    result: PromiseLike<any> | any
    status: PromiseStatus | null
    onfulfilled?: OnFulfilled
    onrejected?: OnRejected
    root: boolean
  }) => Promise<unknown> | any
}
```

## Parameters

- `delayTime` (required): Delay time in milliseconds

## Details

- Executes at all nodes in the stream chain, not just a single node
- Only delays in the following cases:
  - Root node (`root=true`)
  - Nodes with a success handler (`onfulfilled`)
  - Nodes with an error handler (`onrejected`) and status is `REJECTED`
- Wraps the result in a `Promise` that resolves after the specified time
- For `Promise` type results, waits for the Promise to resolve before starting the delay timer
- Serial delay: each node's delay is cumulative

## Examples

### Scenario 1: Basic Delay

```typescript
import { $, delayAll } from 'fluth'

const stream$ = $().use(delayAll(100))

stream$.then((value) => {
  console.log(value)
})

stream$.next(1)
// Output after 100ms: 1
```

### Scenario 2: Serial Delay in Stream Chain

```typescript
import { $, delayAll, consoleNode } from 'fluth'

// Chain: root(1) -> then(+1=2) -> then(+1=3) -> consoleNode
// Each node is delayed serially: node resolves -> delay -> next node
const promise$ = $().use(delayAll(100))

promise$
  .then((value) => value + 1)
  .then((value) => value + 1)
  .use(consoleNode())

promise$.next(1)

// 0ms: nothing resolved yet
// 100ms: root node resolves with value 1, passes to first then
// 200ms: first then resolves with value 2, passes to second then
// 300ms: second then resolves with value 3, consoleNode logs
// Output: resolve 3
```

### Scenario 3: consoleNode on Each Node

```typescript
import { $, delayAll, consoleNode } from 'fluth'

const promise$ = $().use(delayAll(100), consoleNode())

promise$
  .then((value) => value + 1)
  .use(consoleNode())
  .then((value) => value + 1)
  .use(consoleNode())

promise$.next(1)

// After 100ms: resolve 1
// After 200ms: resolve 2
// After 300ms: resolve 3
```

### Scenario 4: Handling Promise Values

```typescript
import { $, delayAll } from 'fluth'

const stream$ = $().use(delayAll(100))

stream$.then((value) => {
  console.log(value)
})

stream$.next(Promise.resolve(42))
// Output after 100ms: 42
```

### Scenario 5: Multiple next Calls

```typescript
import { $, delayAll } from 'fluth'

const stream$ = $().use(delayAll(100))
const results: number[] = []

stream$.then((value) => {
  results.push(value)
})

stream$.next(1)
stream$.next(2)
stream$.next(3)

// After 100ms, due to observable behavior, only the last value is processed
// results: [3]
```

## Difference from delayNode

- `delayNode` only delays at the current node, does not affect child nodes
- `delayAll` delays at all nodes in the stream chain

```typescript
import { $, delayNode, delayAll, consoleNode } from 'fluth'

// Using delayNode: only delays at root node
const stream1$ = $().use(delayNode(100), consoleNode())
stream1$.then((v) => v + 1).use(consoleNode())
stream1$.next(1)
// After 100ms: resolve 1
// Immediately: resolve 2

// Using delayAll: all nodes are delayed
const stream2$ = $().use(delayAll(100), consoleNode())
stream2$.then((v) => v + 1).use(consoleNode())
stream2$.next(1)
// After 100ms: resolve 1
// After 200ms: resolve 2
```

### Scenario 6: Calculating Total Delay Time

```typescript
import { $, delayAll } from 'fluth'

// Chain: root(1) -> then(+1=2) -> then(+1=3) -> then(set result)
// delayAll delays EVERY node serially: 50ms * 3 nodes = 150ms total
const promise$ = $().use(delayAll(50))

let result: number | undefined

promise$
  .then((value) => value + 1)
  .then((value) => value + 1)
  .then((value) => {
    result = value
  })

promise$.next(1)

// 0ms: result = undefined
// 50ms: root resolves with 1, result = undefined
// 100ms: first then resolves with 2, result = undefined
// 150ms: second then resolves with 3, result = 3
```
