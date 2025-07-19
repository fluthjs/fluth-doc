# executePlugin

Plugin triggered when processing data at a node, used to modify, monitor, or record the data flowing through a node. Every node can use an execute plugin to intervene in the data processing process.

## Type Definition

```typescript
type executePlugin<T> = (params: {
  result: Promise<T> | T
  set: (setter: (state: T) => Promise<void> | void) => Promise<T> | T
  root: boolean
  status: PromiseStatus | null
  onfulfilled?: OnFulfilled
  onrejected?: OnRejected
  unsubscribe: () => void
}) => Promise<any> | any
```

## Parameters

- `result`: The processing result of the current node, can be a synchronous value or Promise
- `set`: Immutable state update function, used to safely modify object state
- `root`: Boolean value indicating whether the current node is the root node
- `status`: The status of the current node (`pending`, `resolved`, `rejected`)
- `onfulfilled`: Success handler function of the current node (optional)
- `onrejected`: Error handler function of the current node (optional)
- `unsubscribe`: Unsubscribe function

## Return Value

Returns the processed result, can be a synchronous value or Promise, will replace the original result.

## Details

- **Triggered during data processing**: Called when the node processes data, can modify or monitor data
- **Per-node level**: Used independently on each node, does not affect other nodes
- **Result replacement**: Non-`undefined` return values will replace the original processing result
- **Chained processing**: Multiple execute plugins are executed in order, each receiving the result of the previous plugin

## Execution Mechanism

2. **Execution order**: Executes `executeAll` plugins first, then the current node's `execute` plugins
3. **Error handling**: Errors in plugins are safely handled and will not interrupt the entire process

## Usage Scenarios

### Scenario 1: Data validation and transformation

```typescript
import { $ } from 'fluth'

// Data validation plugin
const validationPlugin = {
  execute: ({ result, root }) => {
    // Skip Promise-type processing
    if (result instanceof Promise) return result

    // Root node data validation
    if (root && typeof result === 'string') {
      const trimmed = result.trim()
      if (trimmed.length === 0) {
        throw new Error('Input data cannot be empty')
      }
      console.log(`Root node validation passed: "${result}" -> "${trimmed}"`)
      return trimmed
    }

    // Number range validation
    if (typeof result === 'number') {
      if (result < 0) {
        console.log(`Number validation failed: ${result} < 0`)
        return 0 // Correct to minimum value
      }
      if (result > 100) {
        console.log(`Number validation warning: ${result} > 100`)
        return 100 // Correct to maximum value
      }
    }

    return result
  },
}

const stream$ = $().use(validationPlugin)

const processor$ = stream$
  .then((data) => data.length) // Get string length
  .use(validationPlugin) // Use validation on child node
  .then((length) => {
    console.log('Valid length:', length)
    return length
  })

stream$.next('  hello world  ')
// Output:
// Root node validation passed: "  hello world  " -> "hello world"
// Valid length: 11

stream$.next('') // Empty string
// Output: Error: Input data cannot be empty
```

### Scenario 2: Performance monitoring and logging

```typescript
import { $ } from 'fluth'

// Performance monitoring plugin
const performanceLoggerPlugin = {
  execute: ({ result, root, status }) => {
    const nodeType = root ? 'ROOT' : 'CHILD'
    const timestamp = new Date().toISOString()

    // Log node execution info
    console.log(`[${timestamp}] ${nodeType} node executed:`, {
      status,
      dataType: typeof result,
      isPromise: result instanceof Promise,
      dataPreview:
        result instanceof Promise
          ? 'Promise'
          : typeof result === 'string'
          ? result.substring(0, 50)
          : result,
    })

    // For Promise type, add performance monitoring
    if (result instanceof Promise) {
      const startTime = Date.now()

      return result.then(
        (value) => {
          const duration = Date.now() - startTime
          console.log(`[${timestamp}] ${nodeType} Promise executed, duration: ${duration}ms`)
          return value
        },
        (error) => {
          const duration = Date.now() - startTime
          console.log(
            `[${timestamp}] ${nodeType} Promise execution failed, duration: ${duration}ms`
          )
          throw error
        }
      )
    }

    return result
  },
}

const stream$ = $().use(performanceLoggerPlugin)

const asyncProcessor$ = stream$
  .then(async (data) => {
    // Simulate async processing
    await new Promise((resolve) => setTimeout(resolve, 100))
    return data.toUpperCase()
  })
  .use(performanceLoggerPlugin) // Monitor child node as well
  .then(async (data) => {
    await new Promise((resolve) => setTimeout(resolve, 50))
    return `Processed result: ${data}`
  })

stream$.next('hello')
// Output detailed performance logs
```
