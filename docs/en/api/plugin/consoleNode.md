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

## Return Value

Returns an execute plugin that only outputs at the current node and returns the original `result` value.

## Core Behavior

- **execute plugin**: Only executes at the current node, does not propagate to child nodes
- **Immediate output**: Outputs the result immediately, regardless of whether there is a handler
- **Promise handling**: For Promise results, waits for resolution before outputting
- **Returns original value**: Returns the original `result` without modifying the data flow

## Usage Scenarios

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

## Notes

1. **Return value**: The plugin always returns the original `result` and does not modify the data flow
2. **Promise handling**: For Promise results, waits for resolution before outputting
3. **Error handling**: For rejected Promises, uses `rejectPrefix` to output error information
4. **Remove plugin**: Can be removed via the `remove` method to stop output
5. **Immediate output**: Each call outputs immediately, not affected by debounce, etc.

## Relationship with Other Plugins

- **vs consoleAll**: `consoleNode` is an execute plugin, only executes at a single node; `consoleAll` is an executeAll plugin, executes on all nodes
- **vs debugNode**: Similar function, but `consoleNode` outputs to the console, `debugNode` triggers debugger breakpoints
- **Applicable scenarios**: `consoleNode` is suitable for debugging data output at a specific node, not for full-chain monitoring

## Practical Example: Data Flow Debugging

```typescript
import { $, debounce } from 'fluth'

const dataStream$ = $<number>()

// Add debugging at different stages of the processing chain
const processed$ = dataStream$
  .use(consoleNode('Raw data'))
  .then((value) => value * 2)
  .use(consoleNode('Multiplied result'))
  .pipe(debounce(100))
  .use(consoleNode('Debounced result'))
  .then((value) => value + 10)
  .use(consoleNode('Final result'))

dataStream$.next(5)
dataStream$.next(10)
dataStream$.next(15)

// Output:
// Raw data 5
// Multiplied result 10
// Raw data 10
// Multiplied result 20
// Raw data 15
// Multiplied result 30
// Debounced result 30
// Final result 40
```
