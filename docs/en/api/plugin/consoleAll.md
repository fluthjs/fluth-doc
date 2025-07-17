# consoleAll

Debug plugin that outputs execution results on all nodes in the stream chain, used for debugging and monitoring data flow.

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

- `resolvePrefix` (optional): Console prefix for successful cases, defaults to `'resolve'`
- `rejectPrefix` (optional): Console prefix for error cases, defaults to `'reject'`

## Return Value

Returns an ExecuteAllPlugin that executes output operations on all nodes in the stream chain.

## Core Behavior

- **executeAll plugin**: Executes on all nodes in the stream chain, not just a single node
- **Smart filtering**: Only outputs in the following cases:
  - Root node (`root=true`)
  - Nodes with success handler (`onfulfilled`)
  - Nodes with error handler (`onrejected`) and status is REJECTED
- **Promise handling**: For Promise-type results, waits for Promise resolution before outputting
- **Original data**: Returns the original `result` without modifying the data flow

## Usage Scenarios

### Scenario 1: Basic Usage

```typescript
import { $ } from 'fluth'

const stream$ = $().use(consoleAll())

stream$.next(1)
// Output: resolve 1

const promise = Promise.resolve(2)
stream$.next(promise)
// Output: resolve 2
```

### Scenario 2: Stream Chain Debugging

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

### Scenario 3: Custom Prefixes

```typescript
import { $ } from 'fluth'

// Custom prefixes
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

### Scenario 4: Combined with Operators

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

### Scenario 5: Complex Stream Chain Monitoring

```typescript
import { $ } from 'fluth'

// Test executeAll propagation in stream chain
const rootStream = $()
rootStream.use(consoleAll('executeAll'))

const step1 = rootStream.then((value) => {
  console.log('step1 processing:', value)
  return value * 2
})

const step2 = step1.then((value) => {
  console.log('step2 processing:', value)
  return value + 10
})

step2.then((value) => {
  console.log('step3 processing:', value)
  return value.toString()
})

rootStream.next(5)
// Output:
// executeAll 5
// step1 processing: 5
// executeAll 10
// step2 processing: 10
// executeAll 20
// step3 processing: 20
// executeAll 20
```

## Edge Case Handling

### Promise Error Handling

```typescript
import { $ } from 'fluth'

const stream$ = $().use(consoleAll())

const rejectedPromise = Promise.reject(new Error('test error'))
stream$.next(rejectedPromise)
// Output: reject Error: test error
```

### Special Value Handling

```typescript
import { $ } from 'fluth'

const stream$ = $().use(consoleAll())

// Test various edge values
stream$.next(null) // Output: resolve null
stream$.next(undefined) // Output: resolve undefined
stream$.next('') // Output: resolve
stream$.next(0) // Output: resolve 0
stream$.next(false) // Output: resolve false
```

### Plugin Removal

```typescript
import { $ } from 'fluth'

const plugin = consoleAll()
const stream$ = $().use(plugin)

stream$.then((value) => value + 1)
stream$.next(1)
// Output: resolve 1, resolve 2

stream$.remove(plugin)
stream$.next(2)
// No more output
```

## Smart Filtering Logic

### Root Node Always Outputs

```typescript
import { $ } from 'fluth'

const stream$ = $().use(consoleAll())
stream$.next('root-value')
// Output: resolve root-value (because it's the root node)
```

### Nodes with Handlers Output

```typescript
import { $ } from 'fluth'

const stream$ = $().use(consoleAll())
const child$ = stream$.then((value) => value + '-processed')
// child$ node will output because it has onfulfilled handler
```

### Error Handler Nodes Output

```typescript
import { $ } from 'fluth'

const stream$ = $().use(consoleAll())
const child$ = stream$.then(undefined, (error) => 'handled-' + error.message)
// Only outputs when status is REJECTED
```

## Status Parameter Support

```typescript
import { $ } from 'fluth'

const plugin = consoleAll()

// Root node always outputs regardless of status
plugin.executeAll({
  result: 'root-value',
  status: PromiseStatus.REJECTED,
  root: true,
})
// Output: resolve root-value

// Non-root node with success handler
plugin.executeAll({
  result: 'fulfilled-value',
  status: PromiseStatus.RESOLVED,
  root: false,
  onfulfilled: (value) => value,
})
// Output: resolve fulfilled-value

// Non-root node with error handler and REJECTED status
plugin.executeAll({
  result: 'error-handled',
  status: PromiseStatus.REJECTED,
  root: false,
  onrejected: (error) => error,
})
// Output: resolve error-handled

// Non-root node without handlers
plugin.executeAll({
  result: 'skip-value',
  status: PromiseStatus.RESOLVED,
  root: false,
})
// No output (skipped)
```

## Important Notes

1. **Return value**: Plugin returns the original `result` without modifying the data flow
2. **Promise handling**: For Promise-type results, waits for Promise resolution before outputting
3. **Error handling**: For rejected Promises, outputs error information
4. **Smart filtering**: Only outputs on meaningful nodes to avoid redundant information
5. **Plugin removal**: Can be removed using the `remove` method to stop output
6. **vs consoleNode**: `consoleAll` executes on all nodes in the stream chain, while `consoleNode` executes only on a single node
7. **Performance consideration**: Should remove debug plugins in production environment for better performance

## Relationship with Other Plugins

- **vs consoleNode**: `consoleAll` is an executeAll plugin that executes on all nodes; `consoleNode` is an execute plugin that executes only on a single node
- **vs debugAll**: Similar functionality, but `consoleAll` outputs to console while `debugAll` triggers debugger breakpoints
- **Use cases**: `consoleAll` is suitable for debugging complex stream chains to understand data flow through each node

## Complete Example: Data Processing Pipeline Debugging

```typescript
import { $, debounce, throttle } from 'fluth'

interface DataItem {
  id: number
  value: string
  timestamp: number
}

const dataStream$ = $<DataItem>().use(consoleAll('data', 'error'))

// Data validation
const validated$ = dataStream$.then((item) => {
  if (!item.id || !item.value) {
    throw new Error(`Invalid data: ${JSON.stringify(item)}`)
  }
  return { ...item, validated: true }
})

// Data transformation
const transformed$ = validated$.pipe(debounce(100)).then((item) => ({
  ...item,
  processed: true,
  processedAt: Date.now(),
}))

// Data storage
const stored$ = transformed$.pipe(throttle(200)).then((item) => {
  // Simulate storage operation
  console.log('Storing data:', item)
  return { ...item, stored: true }
})

// Simulate data input
dataStream$.next({ id: 1, value: 'test1', timestamp: Date.now() })
dataStream$.next({ id: 2, value: 'test2', timestamp: Date.now() })
dataStream$.next({ id: 0, value: '', timestamp: Date.now() }) // Invalid data

// Output will show data flow through each node:
// data { id: 1, value: 'test1', timestamp: ... }
// data { id: 1, value: 'test1', timestamp: ..., validated: true }
// data { id: 2, value: 'test2', timestamp: ... }
// data { id: 2, value: 'test2', timestamp: ..., validated: true }
// error Error: Invalid data: {"id":0,"value":"","timestamp":...}
// ... output after debounce and throttle
```
