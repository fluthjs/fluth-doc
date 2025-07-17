# thenPlugin

A plugin that triggers when creating child nodes, primarily used for node lifecycle management, automatic unsubscription, and resource cleanup operations.

## Type Definition

```typescript
type thenPluginFn<T> = (unsubscribe: () => void, observable: Observable<T>) => void
```

## Parameters

- `unsubscribe`: Unsubscribe function that stops data processing for the current node when called
- `observable`: The newly created child Observable instance

## Core Behavior

- **Triggered on node creation**: Executes when creating child nodes through methods like `then`, `catch`, `finally`
- **Lifecycle management**: Can control node lifecycle and implement automatic unsubscription
- **Resource cleanup**: Suitable for cleanup operations, timer management, etc.
- **Node-level**: Each node can use then plugins, not limited to root nodes

## Execution Mechanism

1. **Trigger timing**: Executes immediately after creating a new child node in the `#thenObserver` method
2. **Execution order**: For root nodes, executes `thenAll` plugins first, then the current node's `then` plugins
3. **Parameter passing**: Passes the `unsubscribe` function and the newly created `observable` instance

## Usage Scenarios

### Scenario 1: Automatic Timed Unsubscription

```typescript
import { $ } from 'fluth'

// Create auto-unsubscribe plugin
const autoUnsubscribePlugin = {
  then: (unsubscribe) => {
    // Auto-unsubscribe after 5 seconds
    setTimeout(unsubscribe, 5000)
  },
}

const stream$ = $().use(autoUnsubscribePlugin)

const observer$ = stream$.then((data) => {
  console.log('Processing data:', data)
})

// Normal processing
stream$.next('hello') // Output: Processing data: hello
stream$.next('world') // Output: Processing data: world

// Auto-unsubscribe after 5 seconds
setTimeout(() => {
  stream$.next('timeout') // No output, already unsubscribed
}, 6000)
```

### Scenario 2: Vue Component Lifecycle Integration

```typescript
import { getCurrentScope, onScopeDispose } from 'vue'
import { $ } from 'fluth'

// Vue component auto-cleanup plugin
const vueLifecyclePlugin = {
  then: (unsubscribe) => {
    // Auto-cleanup within Vue component scope
    if (getCurrentScope()) {
      onScopeDispose(() => {
        console.log('Vue component destroyed, auto-unsubscribe')
        unsubscribe()
      })
    }
  },
}

// Use in Vue component
const stream$ = $().use(vueLifecyclePlugin)

const dataProcessor$ = stream$
  .then((data) => data.toUpperCase())
  .then((data) => {
    console.log('Processing result:', data)
    return data
  })

stream$.next('hello') // Output: Processing result: HELLO
// Auto-cleanup when component is destroyed
```

### Scenario 3: Conditional Unsubscription

```typescript
import { $ } from 'fluth'

// Conditional unsubscribe plugin
const conditionalUnsubscribePlugin = {
  then: (unsubscribe, observable) => {
    // Monitor specific conditions
    const checkCondition = () => {
      // Assume global state management
      if (window.appState?.shouldStopProcessing) {
        console.log('Stop condition detected, unsubscribing')
        unsubscribe()
      }
    }

    // Check condition every second
    const intervalId = setInterval(checkCondition, 1000)

    // Clear timer when node is unsubscribed
    observable.afterUnsubscribe(() => {
      clearInterval(intervalId)
    })
  },
}

const stream$ = $().use(conditionalUnsubscribePlugin)

stream$.then((data) => {
  console.log('Processing data:', data)
})

stream$.next('data1') // Normal processing
// Auto-stop when window.appState.shouldStopProcessing = true
```

### Scenario 4: Error Retry Mechanism

```typescript
import { $ } from 'fluth'

// Error retry plugin
const retryPlugin = {
  then: (unsubscribe, observable) => {
    let retryCount = 0
    const maxRetries = 3

    // Monitor error status
    observable.afterComplete((value, status) => {
      if (status === 'rejected') {
        retryCount++
        console.log(`Error retry ${retryCount}/${maxRetries}`)

        if (retryCount >= maxRetries) {
          console.log('Max retries reached, unsubscribing')
          unsubscribe()
        }
      }
    })
  },
}

const stream$ = $().use(retryPlugin)

const processor$ = stream$
  .then((data) => {
    if (Math.random() > 0.7) {
      throw new Error('Random error')
    }
    return data
  })
  .catch((error) => {
    console.log('Caught error:', error.message)
    return null
  })

// Test error retry
stream$.next('test data')
```

### Scenario 5: Performance Monitoring and Statistics

```typescript
import { $ } from 'fluth'

// Performance monitoring plugin
const performanceMonitorPlugin = {
  then: (unsubscribe, observable) => {
    const startTime = Date.now()
    let executionCount = 0

    // Monitor node completion
    observable.afterComplete((value, status) => {
      executionCount++
      const duration = Date.now() - startTime

      console.log(`Node performance stats:`, {
        executionCount,
        totalDuration: duration,
        averageDuration: duration / executionCount,
        status,
      })

      // Unsubscribe when performance threshold exceeded
      if (duration > 10000) {
        // 10 seconds
        console.log('Node execution time too long, auto-unsubscribe')
        unsubscribe()
      }
    })

    // Cleanup when node is unsubscribed
    observable.afterUnsubscribe(() => {
      console.log('Node unsubscribed, stopping performance monitoring')
    })
  },
}

const stream$ = $().use(performanceMonitorPlugin)

const heavyProcessor$ = stream$
  .then(async (data) => {
    // Simulate heavy computation
    await new Promise((resolve) => setTimeout(resolve, 1000))
    return data.toUpperCase()
  })
  .then((data) => {
    console.log('Processing complete:', data)
    return data
  })

stream$.next('hello')
stream$.next('world')
```

## Important Notes

1. **Execution timing**: then plugins execute immediately when child nodes are created, not during data processing
2. **unsubscribe calls**: Calling `unsubscribe()` stops processing for the current node and all its child nodes
3. **Resource cleanup**: Use `observable.afterUnsubscribe()` to register cleanup callbacks
4. **Async operations**: Async operations within plugins need proper management to avoid memory leaks
5. **Error handling**: Errors within plugins are safely handled and won't interrupt the entire flow

## Relationship with Other Plugins

- **vs execute plugin**: thenPlugin executes on node creation, execute executes during data processing
- **vs thenAll plugin**: thenPlugin is single-node, thenAll is global
- **Use cases**: thenPlugin is suitable for lifecycle management, resource cleanup, conditional control, etc.

## Real-world Application Example

### Resource Management System

```typescript
import { $ } from 'fluth'

// Resource management plugin
class ResourceManager {
  private resources = new Map<string, any>()

  createPlugin(resourceId: string) {
    return {
      then: (unsubscribe, observable) => {
        // Allocate resource
        const resource = this.allocateResource(resourceId)
        this.resources.set(resourceId, resource)

        console.log(`Resource ${resourceId} allocated`)

        // Release resource when node is unsubscribed
        observable.afterUnsubscribe(() => {
          this.releaseResource(resourceId)
          this.resources.delete(resourceId)
          console.log(`Resource ${resourceId} released`)
        })

        // Auto-release on timeout
        setTimeout(() => {
          if (this.resources.has(resourceId)) {
            console.log(`Resource ${resourceId} timeout, auto-release`)
            unsubscribe()
          }
        }, 30000) // 30 second timeout
      },
    }
  }

  private allocateResource(id: string) {
    return { id, createdAt: Date.now(), data: {} }
  }

  private releaseResource(id: string) {
    // Execute resource cleanup logic
    console.log(`Cleaning up resource ${id}`)
  }
}

const resourceManager = new ResourceManager()
const stream$ = $().use(resourceManager.createPlugin('user-session'))

const sessionProcessor$ = stream$
  .then((data) => {
    console.log('Processing session data:', data)
    return data
  })
  .then((data) => {
    console.log('Session processing complete:', data)
    return data
  })

stream$.next({ userId: 123, action: 'login' })
// Auto-release resources after 30 seconds or manual unsubscription
```
