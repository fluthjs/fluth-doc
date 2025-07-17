# executePlugin

A plugin that triggers when nodes process data, used to modify, monitor, or record data flowing through nodes. Each node can use execute plugins to intervene during data processing.

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
- `set`: Immutable state update function for safely modifying object state
- `root`: Boolean indicating whether the current node is the root node
- `status`: Current node status (pending, resolved, rejected)
- `onfulfilled`: Success handler function for the current node (optional)
- `onrejected`: Error handler function for the current node (optional)
- `unsubscribe`: Unsubscribe function

## Return Value

Returns the processed result, can be a synchronous value or Promise. If the return value is not `undefined`, it will replace the original result.

## Core Behavior

- **Triggered during data processing**: Called when nodes execute data processing, can modify or monitor data
- **Single node level**: Each node uses independently, doesn't affect other nodes
- **Result replacement**: Non-`undefined` return values replace the original processing result
- **Chain processing**: Multiple execute plugins execute in order, with later plugins receiving results from earlier ones

## Execution Mechanism

1. **Trigger timing**: Executes in the `#runExecutePlugin` method when nodes process data
2. **Execution order**: For root nodes, executes `executeAll` plugins first, then the current node's `execute` plugins
3. **Error handling**: Errors within plugins are safely handled and won't interrupt the entire flow

## Usage Scenarios

### Scenario 1: Data Validation and Transformation

```typescript
import { $ } from 'fluth'

// Data validation plugin
const validationPlugin = {
  execute: ({ result, root }) => {
    // Skip Promise type processing
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
  .use(validationPlugin) // Child node also uses validation
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

### Scenario 2: Performance Monitoring and Logging

```typescript
import { $ } from 'fluth'

// Performance monitoring plugin
const performanceLoggerPlugin = {
  execute: ({ result, root, status }) => {
    const nodeType = root ? 'ROOT' : 'CHILD'
    const timestamp = new Date().toISOString()

    // Log node execution info
    console.log(`[${timestamp}] ${nodeType} node execution:`, {
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

    // Add performance monitoring for Promise types
    if (result instanceof Promise) {
      const startTime = Date.now()

      return result.then(
        (value) => {
          const duration = Date.now() - startTime
          console.log(`[${timestamp}] ${nodeType} Promise completed, duration: ${duration}ms`)
          return value
        },
        (error) => {
          const duration = Date.now() - startTime
          console.log(`[${timestamp}] ${nodeType} Promise failed, duration: ${duration}ms`)
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
  .use(performanceLoggerPlugin) // Child node also monitors
  .then(async (data) => {
    await new Promise((resolve) => setTimeout(resolve, 50))
    return `Processing result: ${data}`
  })

stream$.next('hello')
// Output detailed performance logs
```

### Scenario 3: Error Handling and Retry

```typescript
import { $ } from 'fluth'

// Error handling plugin
const errorHandlerPlugin = {
  execute: ({ result, root, unsubscribe }) => {
    // Handle Promise type errors
    if (result instanceof Promise) {
      return result.catch((error) => {
        console.log(`${root ? 'Root' : 'Child'} node caught error:`, error.message)

        // Decide handling strategy based on error type
        if (error.message.includes('network')) {
          console.log('Network error, returning cached data')
          return { cached: true, data: null }
        }

        if (error.message.includes('fatal')) {
          console.log('Fatal error, stopping processing')
          unsubscribe()
          throw error
        }

        // Convert other errors to default value
        console.log('General error, using default value')
        return { error: true, message: error.message }
      })
    }

    return result
  },
}

const stream$ = $().use(errorHandlerPlugin)

const processor$ = stream$
  .then((data) => {
    if (data.action === 'network_error') {
      return Promise.reject(new Error('Network connection failed'))
    }
    if (data.action === 'fatal_error') {
      return Promise.reject(new Error('Fatal system error'))
    }
    return data
  })
  .use(errorHandlerPlugin) // Child node also handles errors
  .then((data) => {
    console.log('Final processing result:', data)
    return data
  })

stream$.next({ action: 'network_error' })
// Output: Network error, returning cached data
// Output: Final processing result: { cached: true, data: null }

stream$.next({ action: 'normal', data: 'test' })
// Output: Final processing result: { action: 'normal', data: 'test' }
```

### Scenario 4: Data Caching and Optimization

```typescript
import { $ } from 'fluth'

// Data caching plugin
class CachePlugin {
  private cache = new Map<string, any>()
  private maxSize = 100

  createPlugin(keyGenerator?: (data: any) => string) {
    return {
      execute: ({ result, root }) => {
        // Skip Promise types
        if (result instanceof Promise) return result

        // Generate cache key
        const cacheKey = keyGenerator ? keyGenerator(result) : JSON.stringify(result)

        // Check cache
        if (this.cache.has(cacheKey)) {
          console.log(`Cache hit: ${cacheKey}`)
          return this.cache.get(cacheKey)
        }

        // Cache miss, store result
        if (this.cache.size >= this.maxSize) {
          // Clear oldest cache entry
          const firstKey = this.cache.keys().next().value
          this.cache.delete(firstKey)
        }

        this.cache.set(cacheKey, result)
        console.log(`Cache stored: ${cacheKey}`)

        return result
      },
    }
  }
}

const cachePlugin = new CachePlugin()
const stream$ = $().use(cachePlugin.createPlugin((data) => `user_${data.id}`))

const processor$ = stream$
  .then((userData) => {
    // Simulate complex computation
    console.log('Executing complex computation...')
    return {
      ...userData,
      computed: userData.value * 2 + 10,
      timestamp: Date.now(),
    }
  })
  .use(cachePlugin.createPlugin((data) => `computed_${data.id}`)) // Child node also uses cache
  .then((result) => {
    console.log('Computation complete:', result)
    return result
  })

stream$.next({ id: 1, value: 5 })
// Output: Cache stored: user_1
// Output: Executing complex computation...
// Output: Cache stored: computed_1

stream$.next({ id: 1, value: 5 }) // Same data
// Output: Cache hit: user_1
// Output: Cache hit: computed_1
```

### Scenario 5: Data Formatting and Serialization

```typescript
import { $ } from 'fluth'

// Data formatting plugin
const formatterPlugin = {
  execute: ({ result, root, set }) => {
    // Skip Promise types
    if (result instanceof Promise) return result

    // Root node: standardize input data
    if (root && typeof result === 'object' && result !== null) {
      return {
        ...result,
        _formatted: true,
        _timestamp: Date.now(),
        _nodeType: 'root',
      }
    }

    // String formatting
    if (typeof result === 'string') {
      return {
        type: 'string',
        value: result,
        length: result.length,
        formatted: result.trim().toLowerCase(),
      }
    }

    // Number formatting
    if (typeof result === 'number') {
      return {
        type: 'number',
        value: result,
        formatted: result.toFixed(2),
        isInteger: Number.isInteger(result),
      }
    }

    // Array formatting
    if (Array.isArray(result)) {
      return {
        type: 'array',
        value: result,
        length: result.length,
        formatted: result.map((item) => (typeof item === 'string' ? item.trim() : item)),
      }
    }

    return result
  },
}

const stream$ = $().use(formatterPlugin)

const processor$ = stream$
  .then((data) => {
    console.log('Formatted data:', data)
    return data.value || data // Extract actual value
  })
  .use(formatterPlugin) // Child node also formats
  .then((data) => {
    console.log('Final formatted result:', data)
    return data
  })

stream$.next({ name: 'John', age: 25 })
// Output root node and child node formatting results

stream$.next('  Hello World  ')
// Output string formatting results

stream$.next([1, 2, 3])
// Output array formatting results
```

## Important Notes

1. **Return value handling**: Only non-`undefined` return values replace the original result
2. **Promise handling**: For Promise type results, need to return Promise to maintain async chain
3. **Error handling**: Errors within plugins are safely handled using `safeCallback` wrapper
4. **Performance considerations**: Avoid complex synchronous computations within plugins
5. **State management**: Use the `set` function to safely modify object state

## Relationship with Other Plugins

- **vs executeAll plugin**: executePlugin is single-node, executeAll is global
- **vs then plugin**: executePlugin executes during data processing, then plugin executes on node creation
- **Use cases**: executePlugin is suitable for data processing, validation, transformation, etc.

## Real-world Application Example

### API Data Processing Pipeline

```typescript
import { $ } from 'fluth'

// API data processing plugin
class APIDataProcessor {
  createPlugin(options: { validate?: boolean; transform?: boolean; cache?: boolean }) {
    return {
      execute: ({ result, root, status }) => {
        // Skip Promise type intermediate processing
        if (result instanceof Promise) {
          return result.then((data) => this.processData(data, options, root))
        }

        return this.processData(result, options, root)
      },
    }
  }

  private processData(data: any, options: any, isRoot: boolean) {
    let processed = data

    // Data validation
    if (options.validate) {
      processed = this.validateData(processed, isRoot)
    }

    // Data transformation
    if (options.transform) {
      processed = this.transformData(processed, isRoot)
    }

    // Cache processing
    if (options.cache) {
      processed = this.cacheData(processed, isRoot)
    }

    return processed
  }

  private validateData(data: any, isRoot: boolean) {
    if (isRoot && (!data || typeof data !== 'object')) {
      throw new Error('Root node data must be an object')
    }

    console.log(`${isRoot ? 'Root' : 'Child'} node data validation passed`)
    return data
  }

  private transformData(data: any, isRoot: boolean) {
    if (typeof data === 'object' && data !== null) {
      return {
        ...data,
        _processed: true,
        _timestamp: Date.now(),
        _nodeType: isRoot ? 'root' : 'child',
      }
    }
    return data
  }

  private cacheData(data: any, isRoot: boolean) {
    // Implement caching logic
    console.log(`${isRoot ? 'Root' : 'Child'} node data cached`)
    return data
  }
}

const processor = new APIDataProcessor()
const stream$ = $().use(
  processor.createPlugin({
    validate: true,
    transform: true,
    cache: true,
  })
)

const apiProcessor$ = stream$
  .then(async (data) => {
    // Simulate API call
    const response = await fetch(`/api/users/${data.id}`)
    return response.json()
  })
  .use(processor.createPlugin({ transform: true })) // Child node transformation
  .then((userData) => {
    console.log('API data processing complete:', userData)
    return userData
  })

stream$.next({ id: 123, action: 'fetch' })
```
