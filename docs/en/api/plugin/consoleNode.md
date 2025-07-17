# consoleNode

Debug plugin that outputs execution results at the current node, used for debugging and monitoring individual nodes.

## Type Definition

```typescript
consoleNode: (resolvePrefix?: string, rejectPrefix?: string) => {
  execute: ({ result }: { result: Promise<any> | any }) => any
}
```

## Parameters

- `resolvePrefix` (optional): Console prefix for successful results, defaults to `'resolve'`
- `rejectPrefix` (optional): Console prefix for failed results, defaults to `'reject'`

## Return Value

Returns an execute plugin that performs output operations only at the current node, returning the original `result` value.

## Core Behavior

- **execute plugin**: Only executes at the current node, does not propagate to child nodes
- **Immediate output**: Outputs results immediately regardless of whether there are handler functions
- **Promise handling**: For Promise-type results, waits for Promise resolution before outputting
- **Return original value**: Returns the original `result` without modifying the data stream

## Usage Scenarios

### Scenario 1: Basic Debug Output

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

### Scenario 2: Custom Prefix

```typescript
import { $ } from 'fluth'

const stream$ = $().use(consoleNode('custom'))

stream$.next('test')
// Output: custom test

const promise = Promise.resolve('async-test')
stream$.next(promise)
// Output: custom async-test
```

### Scenario 3: Custom Success and Failure Prefixes

```typescript
import { $ } from 'fluth'

const stream$ = $().use(consoleNode('success', 'failure'))

// Test success case
stream$.next('test-value')
// Output: success test-value

// Test failure case
const rejectedPromise = Promise.reject(new Error('custom error'))
stream$.next(rejectedPromise)
// Output: failure Error: custom error
```

### Scenario 4: Combined with Debounce Operator

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

// Immediate output (each next triggers consoleNode):
// resolve 1
// resolve 2
// resolve 3
// resolve 4
// resolve 5

// Output after 100ms (debounced result):
// resolve 5
// 5
```

### Scenario 5: Plugin Removal

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

## Edge Case Handling

### Special Value Handling

```typescript
import { $ } from 'fluth'

const stream$ = $().use(consoleNode())

// Test various edge values
stream$.next(null) // Output: resolve null
stream$.next(undefined) // Output: resolve undefined
stream$.next('') // Output: resolve
stream$.next(0) // Output: resolve 0
stream$.next(false) // Output: resolve false
```

### Promise Error Handling

```typescript
import { $ } from 'fluth'

const stream$ = $().use(consoleNode())

const rejectedPromise = Promise.reject(new Error('test error'))
stream$.next(rejectedPromise)
// Output: reject Error: test error
```

### Plugin Return Value Verification

```typescript
import { $ } from 'fluth'

const plugin = consoleNode()

// Test synchronous value
const syncResult = plugin.execute({ result: 'sync-value' })
console.log(syncResult === 'sync-value') // true
// Output: resolve sync-value

// Test Promise value
const promiseValue = Promise.resolve('async-value')
const asyncResult = plugin.execute({ result: promiseValue })
console.log(asyncResult === promiseValue) // true
// Output: resolve async-value
```

## Important Notes

1. **Return value**: The plugin returns the original `result` without modifying the data stream
2. **Promise handling**: For Promise-type results, waits for Promise resolution before outputting
3. **Error handling**: For rejected Promises, uses `rejectPrefix` to output error information
4. **Plugin removal**: Can be removed via the `remove` method to stop output
5. **Immediate output**: Each call outputs immediately, unaffected by debounce and other operators

## Relationship with Other Plugins

- **vs consoleAll**: `consoleNode` is an execute plugin that only executes at a single node; `consoleAll` is an executeAll plugin that executes at all nodes
- **vs debugNode**: Similar functionality, but `consoleNode` outputs to console while `debugNode` triggers debugger breakpoints
- **Use cases**: `consoleNode` is suitable for debugging specific node data output when full chain monitoring is not needed

## Practical Application Examples

### API Request Monitoring

```typescript
import { $, throttle } from 'fluth'

const apiStream$ = $<string>()

// Add monitoring at key nodes
const monitoredApi$ = apiStream$
  .use(consoleNode('Request URL'))
  .then((url) => {
    return fetch(url).then((res) => res.json())
  })
  .use(consoleNode('API Response'))
  .then((data) => {
    return { processedData: data, timestamp: Date.now() }
  })
  .use(consoleNode('Processing Result'))

apiStream$.next('https://api.example.com/data')
// Output:
// Request URL https://api.example.com/data
// API Response { ... }
// Processing Result { processedData: {...}, timestamp: ... }
```

### Data Stream Debugging

```typescript
import { $, debounce } from 'fluth'

const dataStream$ = $<number>()

// Add debugging at different stages of the processing chain
const processed$ = dataStream$
  .use(consoleNode('Raw Data'))
  .then((value) => value * 2)
  .use(consoleNode('Multiplication Result'))
  .pipe(debounce(100))
  .use(consoleNode('Debounced Result'))
  .then((value) => value + 10)
  .use(consoleNode('Final Result'))

dataStream$.next(5)
dataStream$.next(10)
dataStream$.next(15)

// Output:
// Raw Data 5
// Multiplication Result 10
// Raw Data 10
// Multiplication Result 20
// Raw Data 15
// Multiplication Result 30
// Debounced Result 30
// Final Result 40
```
