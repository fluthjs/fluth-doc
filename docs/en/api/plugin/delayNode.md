# delayNode

A delay execution plugin that delays the processing result for a specified time before pushing it to child nodes at the current node.

## Type Definition

```typescript
delayNode: (delayTime: number) => {
  execute: ({ result }: { result: PromiseLike<any> | any }) => Promise<unknown>
}
```

## Parameters

- `delayTime` (required): Delay time in milliseconds

## Details

- Only executes at the current node, does not propagate to child nodes
- Wraps the result in a `Promise` that resolves after the specified time
- For `Promise` type results, waits for the Promise to resolve before starting the delay timer
- Precisely controls the timing rhythm of the data flow

## Examples

### Scenario 1: Basic Delay

```typescript
import { $, delayNode } from 'fluth'

const stream$ = $().use(delayNode(100))

stream$.then((value) => {
  console.log(value)
})

stream$.next(1)
// Output after 100ms: 1
```

### Scenario 2: Combined with Other Plugins

```typescript
import { $, delayNode, consoleNode } from 'fluth'

const promise$ = $().use(delayNode(100), consoleNode())

promise$
  .then((value) => value + 1)
  .use(delayNode(100), consoleNode())
  .then((value) => value + 1)
  .use(delayNode(100), consoleNode())

promise$.next(1)
// Output after 100ms: resolve 1
// Output after 200ms: resolve 2
// Output after 300ms: resolve 3
```

### Scenario 3: Pipeline Delayed Processing

```typescript
import { $, delayNode } from 'fluth'

const processingStream$ = $()

// Step 1: Data preprocessing (delay 200ms)
const preprocessed$ = processingStream$.use(delayNode(200)).then((data) => {
  console.log('Preprocessing complete:', data)
  return { ...data, preprocessed: true }
})

// Step 2: Data validation (delay 300ms)
const validated$ = preprocessed$.use(delayNode(300)).then((data) => {
  console.log('Validation complete:', data)
  return { ...data, validated: true }
})

// Step 3: Data storage (delay 150ms)
const stored$ = validated$.use(delayNode(150)).then((data) => {
  console.log('Storage complete:', data)
  return { ...data, stored: true }
})

processingStream$.next({ id: 1, content: 'test data' })
// After 200ms: Preprocessing complete: { id: 1, content: 'test data', preprocessed: true }
// After 300ms: Validation complete: { id: 1, content: 'test data', preprocessed: true, validated: true }
// After 150ms: Storage complete: { id: 1, content: 'test data', preprocessed: true, validated: true, stored: true }
```

### Scenario 4: Removing Plugin

```typescript
import { $, delayNode } from 'fluth'

const plugin = delayNode(100)
const stream$ = $().use(plugin)

stream$.then((value) => {
  console.log(value)
})

stream$.next(1)
// Output after 100ms: 1

stream$.remove(plugin)
stream$.next(2)
// Output immediately: 2 (no delay)
```

## Difference from delayAll

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
