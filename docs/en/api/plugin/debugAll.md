# debugAll

Debugging plugin that triggers debugger breakpoints on all nodes of the stream chain, used for deep debugging and flow tracing, can only be used on `Stream` nodes.
:::warning Note
Browsers may filter out `debugger` statements in `node_modules`, causing breakpoints to not work. You may need to manually enable `node_modules` debugging in your browser's developer tools settings -> ignore list.
:::

## Type Definition

```typescript
debugAll: () => {
  executeAll: ({
    result,
    onfulfilled,
    onrejected,
    root,
  }: {
    result: Promise<any> | any
    onfulfilled?: OnFulfilled
    onrejected?: OnRejected
    root: boolean
  }) => any
}
```

## Return Value

Returns an ExecuteAllPlugin that triggers debugger breakpoints on all nodes of the stream chain.

## Core Behavior

- **executeAll plugin**: Executes on all nodes of the stream chain, not just a single node
- **Debugger trigger**: Triggers a `debugger` statement on nodes that meet the conditions
- **Promise handling**: For Promise results, waits for Promise resolution before triggering the debugger
- **Original data**: Returns the original `result` without modifying the data flow

## Usage Scenarios

### Scenario 1: Basic usage

```typescript
import { $ } from 'fluth'

const promise$ = $().use(debugAll())

promise$.then((value) => value + 1).then((value) => value + 1)

promise$.next(1)
// In browser devtools, a debugger breakpoint will be triggered at each node
```

### Scenario 2: Complex stream chain debugging

```typescript
import { $ } from 'fluth'

// Test executeAll propagation in the stream chain
const rootStream = $()
rootStream.use(debugAll())

const step1 = rootStream.then((value) => {
  console.log('step1 processed:', value)
  return value * 2
})

const step2 = step1.then((value) => {
  console.log('step2 processed:', value)
  return value + 10
})

step2.then((value) => {
  console.log('final result:', value)
})

rootStream.next(5)
// A debugger breakpoint will be triggered at each node:
// 1. rootStream node
// 2. step1 node
// 3. step2 node
// 4. final subscription node
```

### Scenario 3: Promise error debugging

```typescript
import { $ } from 'fluth'

const promise$ = $().use(debugAll())

promise$.then((value) => value + 1)

const rejectedPromise = Promise.reject(new Error('test error'))
promise$.next(rejectedPromise)
// A debugger breakpoint will be triggered during error handling
```

### Scenario 4: Flow tracing

```typescript
import { $ } from 'fluth'

const stream$ = $().use(debugAll())

// Create multiple processing steps
const validation$ = stream$.then((data) => {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid data')
  }
  return { ...data, validated: true }
})

const transformation$ = validation$.then((data) => {
  return {
    ...data,
    processed: true,
    timestamp: Date.now(),
  }
})

const storage$ = transformation$.then((data) => {
  console.log('Storing data:', data)
  return { ...data, stored: true }
})

stream$.next({ id: 1, name: 'test' })
// The debugger will pause at each step, allowing inspection of the data flow
```

## Notes

1. **Return value**: The plugin returns the original `result` without modifying the data flow
2. **Promise handling**: For Promise results, waits for Promise resolution before triggering the debugger
3. **Error handling**: For rejected Promises, triggers the debugger during error handling
4. **Intelligent filtering**: Skips debugger trigger when `root=false` and there is no `onfulfilled` or `onrejected`
5. **Remove plugin**: Can be removed via the `remove` method to stop debugging
6. **Development environment**: The debugger is mainly for development; remove in production
7. **Browser support**: Use in environments that support the `debugger` statement (browser devtools)

## Relationship with Other Plugins

- **vs debugNode**: `debugAll` triggers debugger breakpoints on all nodes; `debugNode` only triggers on a single node
- **vs consoleAll**: Similar function, but `debugAll` triggers breakpoints, `consoleAll` outputs to the console
- **Applicable scenarios**: `debugAll` is suitable for deep debugging of complex stream chains and step-by-step tracing
