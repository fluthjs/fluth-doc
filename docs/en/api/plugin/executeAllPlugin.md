# executeAllPlugin

Global execution plugin that executes at every node when processing data in the stream chain, used for global monitoring and handling of data flow execution processes.

## Type Definition

```typescript
executeAllPlugin: (params: {
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

- `result`: The execution result of the current node (can be Promise or synchronous value)
- `set`: Immutable state setter function for safely modifying object state
- `root`: Whether it's the root node
- `status`: Current node status (pending, resolved, rejected)
- `onfulfilled`: Success handler function of the current node
- `onrejected`: Error handler function of the current node
- `unsubscribe`: Unsubscribe function

## Return Value

Returns the processed result, can be synchronous value or Promise. If the return value is not `undefined`, it will replace the original result.

## Core Behavior

- **Global execution**: Executes at every node when processing data in the stream chain
- **Data processing**: Can modify, monitor, or log data flowing through
- **Root node only**: Can only be used on the root Stream node, child nodes cannot use executeAll plugins
- **Chain processing**: Multiple executeAll plugins execute in sequence, with each plugin receiving the result of the previous plugin

## Execution Mechanism

From the source code, the executeAll plugin execution logic:

```typescript
#runExecutePlugin(result: any) {
  const executeAll = this._root
    ? this._root.#plugin.executeAll.concat(this.#plugin.execute)
    : this.#plugin.execute
  if (!executeAll.length) return result

  const context = {
    result,
    status: this.status,
    set: (setter) => this.#set(result, setter),
    root: !this.#parent,
    onfulfilled: this.#resolve,
    onrejected: this.#reject,
    unsubscribe: () => this.#unsubscribeObservable(),
  }

  // use reduce from left to right to compose plugins
  return executeAll.reduce((prevResult, plugin) => {
    return safeCallback(() => plugin({ ...context, result: prevResult }))() ?? prevResult
  }, context.result)
}
```

- Merges the root node's `executeAll` plugins with the current node's `execute` plugins
- Uses `reduce` to execute plugins sequentially from left to right
- Each plugin receives the result of the previous plugin as input

## Usage Scenarios

### Scenario 1: Global Logging

```typescript
import { $ } from 'fluth'

// Log all node data flow
const globalLogger = ({ result, root, status }) => {
  const nodeType = root ? 'ROOT' : 'CHILD'
  const timestamp = new Date().toISOString()

  console.log(`[${timestamp}] ${nodeType} node execution:`, {
    status,
    result: result instanceof Promise ? 'Promise' : result,
    type: typeof result,
  })

  // Return original result, don't modify data flow
  return result
}

const stream$ = $().use({ executeAll: globalLogger })

const pipeline$ = stream$
  .then((value) => value * 2)
  .then((value) => value + 10)
  .catch((error) => 'error handled')

stream$.next(5)
// Output:
// [2024-01-01T00:00:00.000Z] ROOT node execution: { status: 'resolved', result: 5, type: 'number' }
// [2024-01-01T00:00:00.001Z] CHILD node execution: { status: 'resolved', result: 10, type: 'number' }
// [2024-01-01T00:00:00.002Z] CHILD node execution: { status: 'resolved', result: 20, type: 'number' }
```

### Scenario 2: Data Validation and Cleaning

```typescript
import { $ } from 'fluth'

// Global data validation and cleaning
const dataValidator = ({ result, root }) => {
  // Only process non-Promise data
  if (result instanceof Promise) return result

  // Data type validation
  if (typeof result === 'string') {
    // Clean string data
    const cleaned = result.trim().toLowerCase()
    console.log(`Data cleaning: "${result}" -> "${cleaned}"`)
    return cleaned
  }

  if (typeof result === 'number') {
    // Validate number range
    if (result < 0) {
      console.log(`Data validation failed: negative number ${result}`)
      throw new Error(`Invalid value: ${result}`)
    }
    if (result > 1000) {
      console.log(`Data validation warning: value too large ${result}`)
      return 1000 // Limit maximum value
    }
  }

  return result
}

const stream$ = $().use({ executeAll: dataValidator })

const textProcessor$ = stream$
  .then((text) => text.toUpperCase())
  .then((text) => `Processing result: ${text}`)

const numberProcessor$ = stream$.then((num) => num * 100).then((num) => num + 1)

textProcessor$.then((result) => console.log('Text result:', result))
numberProcessor$.then((result) => console.log('Number result:', result))

stream$.next('  Hello World  ')
// Output:
// Data cleaning: "  Hello World  " -> "hello world"
// Text result: Processing result: HELLO WORLD

stream$.next(15)
// Output:
// Number result: 1501

stream$.next(-5)
// Output:
// Data validation failed: negative number -5
// Error: Invalid value: -5
```

### Scenario 3: Performance Monitoring and Statistics

```typescript
import { $ } from 'fluth'

// Performance monitoring plugin
class PerformanceMonitor {
  private stats = {
    totalExecutions: 0,
    rootExecutions: 0,
    childExecutions: 0,
    promiseCount: 0,
    errorCount: 0,
    executionTimes: [],
  }

  createPlugin() {
    return ({ result, root, status }) => {
      const startTime = Date.now()

      // Update statistics
      this.stats.totalExecutions++
      if (root) {
        this.stats.rootExecutions++
      } else {
        this.stats.childExecutions++
      }

      if (result instanceof Promise) {
        this.stats.promiseCount++

        // Monitor Promise execution time
        return result.then(
          (value) => {
            const duration = Date.now() - startTime
            this.stats.executionTimes.push(duration)
            console.log(`Async execution completed, duration: ${duration}ms`)
            return value
          },
          (error) => {
            this.stats.errorCount++
            const duration = Date.now() - startTime
            console.log(`Async execution failed, duration: ${duration}ms`)
            throw error
          }
        )
      } else {
        const duration = Date.now() - startTime
        this.stats.executionTimes.push(duration)
        console.log(`Sync execution completed, duration: ${duration}ms`)
      }

      return result
    }
  }

  getStats() {
    const avgTime =
      this.stats.executionTimes.length > 0
        ? this.stats.executionTimes.reduce((a, b) => a + b, 0) / this.stats.executionTimes.length
        : 0

    return {
      ...this.stats,
      averageExecutionTime: avgTime.toFixed(2) + 'ms',
    }
  }
}

const monitor = new PerformanceMonitor()
const stream$ = $().use({ executeAll: monitor.createPlugin() })

const asyncPipeline$ = stream$
  .then(async (value) => {
    await new Promise((resolve) => setTimeout(resolve, 100))
    return value * 2
  })
  .then(async (value) => {
    await new Promise((resolve) => setTimeout(resolve, 50))
    return value + 10
  })

asyncPipeline$.then((result) => {
  console.log('Final result:', result)
  console.log('Performance stats:', monitor.getStats())
})

stream$.next(5)
```

### Scenario 4: Error Handling and Retry

```typescript
import { $ } from 'fluth'

// Global error handling and retry mechanism
const errorHandler = ({ result, root, status, unsubscribe }) => {
  if (result instanceof Promise) {
    return result.catch((error) => {
      console.log('Caught error:', error.message)

      // Decide handling strategy based on error type
      if (error.message.includes('network')) {
        console.log('Network error, attempting retry...')
        // Retry logic can be implemented here
        return Promise.reject(new Error('Network error, retried'))
      }

      if (error.message.includes('fatal')) {
        console.log('Fatal error, stopping processing')
        unsubscribe()
        return Promise.reject(error)
      }

      // Convert other errors to default value
      console.log('General error, using default value')
      return null
    })
  }

  return result
}

const stream$ = $().use({ executeAll: errorHandler })

const pipeline$ = stream$
  .then((value) => {
    if (value === 'network_error') {
      throw new Error('Network connection failed')
    }
    if (value === 'fatal_error') {
      throw new Error('Fatal system error')
    }
    if (value === 'normal_error') {
      throw new Error('General processing error')
    }
    return value
  })
  .then((value) => {
    console.log('Processing successful:', value)
    return value
  })
  .catch((error) => {
    console.log('Final error handling:', error.message)
    return 'error_handled'
  })

// Test different types of errors
stream$.next('network_error')
stream$.next('normal_error')
stream$.next('fatal_error')
stream$.next('success')
```

### Scenario 5: Data Transformation and Formatting

```typescript
import { $ } from 'fluth'

// Global data transformer
const dataTransformer = ({ result, root }) => {
  // Skip Promise types
  if (result instanceof Promise) return result

  // Transform based on data type
  if (typeof result === 'string') {
    // Transform string to object
    return {
      type: 'string',
      value: result,
      length: result.length,
      timestamp: Date.now(),
    }
  }

  if (typeof result === 'number') {
    // Transform number to object
    return {
      type: 'number',
      value: result,
      isPositive: result > 0,
      timestamp: Date.now(),
    }
  }

  if (Array.isArray(result)) {
    // Transform array
    return {
      type: 'array',
      value: result,
      length: result.length,
      timestamp: Date.now(),
    }
  }

  // Keep other types unchanged
  return result
}

const stream$ = $().use({ executeAll: dataTransformer })

const processor$ = stream$
  .then((data) => {
    console.log('Processing data:', data)
    return data.value // Extract actual value
  })
  .then((value) => {
    console.log('Final value:', value)
    return value
  })

stream$.next('hello')
// Output:
// Processing data: { type: 'string', value: 'hello', length: 5, timestamp: ... }
// Final value: hello

stream$.next(42)
// Output:
// Processing data: { type: 'number', value: 42, isPositive: true, timestamp: ... }
// Final value: 42

stream$.next([1, 2, 3])
// Output:
// Processing data: { type: 'array', value: [1, 2, 3], length: 3, timestamp: ... }
// Final value: [1, 2, 3]
```

## Important Notes

1. **Root node only**: executeAll plugins can only be used on the root Stream node, using on child nodes will throw an error
2. **Return value affects data flow**: If plugin returns non-`undefined` value, it will replace the original result
3. **Promise handling**: Plugins can return Promise to handle asynchronous operations
4. **Execution order**: Multiple executeAll plugins execute in the order they were added
5. **Error handling**: Errors in plugins will interrupt the entire data flow, need proper handling
6. **Performance consideration**: Since it executes at every node, avoid complex computational operations

## Relationship with Other Plugins

- **vs execute plugin**: executeAll executes at all nodes, execute plugin only executes at specific nodes
- **vs thenAll**: executeAll executes during data flow, thenAll executes during node creation
- **vs then plugin**: executeAll is global, then plugin is single-node
- **Use cases**: executeAll is suitable for global data processing, monitoring, validation, and other scenarios that need to intervene during data flow

## Limitations

```typescript
// ❌ Error: Child nodes cannot use executeAll
const stream$ = $()
const child$ = stream$.then((value) => value + 1)
child$.use({ executeAll: somePlugin }) // Throws error

// ✅ Correct: Can only be used on root node
const stream$ = $().use({ executeAll: somePlugin })
```

## Practical Application Example

### Data Processing Pipeline

```typescript
import { $ } from 'fluth'

// Create complete data processing pipeline
class DataPipeline {
  private middlewares = []

  // Add middleware
  addMiddleware(middleware) {
    this.middlewares.push(middleware)
    return this
  }

  // Create execution plugin
  createExecutePlugin() {
    return ({ result, root, status }) => {
      // Skip Promise type intermediate processing
      if (result instanceof Promise) return result

      // Execute all middlewares sequentially
      return this.middlewares.reduce((data, middleware) => {
        try {
          return middleware(data, { root, status })
        } catch (error) {
          console.error('Middleware execution error:', error)
          return data
        }
      }, result)
    }
  }
}

// Define middlewares
const validateMiddleware = (data, { root }) => {
  if (root && (!data || typeof data !== 'object')) {
    throw new Error('Root node data must be an object')
  }
  return data
}

const enrichMiddleware = (data, { root }) => {
  if (typeof data === 'object' && data !== null) {
    return {
      ...data,
      _enriched: true,
      _timestamp: Date.now(),
      _processed: !root,
    }
  }
  return data
}

const logMiddleware = (data, { root, status }) => {
  const prefix = root ? '[ROOT]' : '[CHILD]'
  console.log(`${prefix} Processing data:`, JSON.stringify(data))
  return data
}

// Create pipeline
const pipeline = new DataPipeline()
  .addMiddleware(validateMiddleware)
  .addMiddleware(enrichMiddleware)
  .addMiddleware(logMiddleware)

const stream$ = $().use({ executeAll: pipeline.createExecutePlugin() })

const processor$ = stream$
  .then((data) => ({ ...data, step: 'processing' }))
  .then((data) => ({ ...data, step: 'completed' }))
  .catch((error) => ({ error: error.message, step: 'error' }))

stream$.next({ id: 1, name: 'test' })
// Output:
// [ROOT] Processing data: {"id":1,"name":"test","_enriched":true,"_timestamp":...,"_processed":false}
// [CHILD] Processing data: {"id":1,"name":"test","_enriched":true,"_timestamp":...,"_processed":true,"step":"processing"}
// [CHILD] Processing data: {"id":1,"name":"test","_enriched":true,"_timestamp":...,"_processed":true,"step":"completed"}
```
