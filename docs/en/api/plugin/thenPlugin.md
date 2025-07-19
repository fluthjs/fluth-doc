# thenPlugin

Plugin triggered when creating child nodes, mainly used for node lifecycle management, automatic unsubscription, and resource cleanup.

## Type Definition

```typescript
type thenPluginFn<T> = (unsubscribe: () => void, observable: Observable<T>) => void
```

## Parameters

- `unsubscribe`: Unsubscribe function, calling it will stop data processing for the current node
- `observable`: The newly created child node Observable instance

## Details

- **Triggered on node creation**: Executes when a child node is created via the `then` method
- **Lifecycle management**: Can control the lifecycle of a node, enabling automatic unsubscription
- **Resource cleanup**: Suitable for cleanup operations, timer management, etc.
- **Node level**: Every node can use a `then` plugin, not limited to the root node

## Execution Mechanism

1. **Trigger timing**: Executes immediately after a new child node is created in the `#thenObserver` method
2. **Execution order**: If it is the root node, executes `thenAll` plugins first, then the current node's `then` plugins
3. **Parameter passing**: Passes the `unsubscribe` function and the newly created `observable` instance

## Usage Scenarios

### Scenario 1: Timed automatic unsubscription

```typescript
import { $ } from 'fluth'

// Timed auto-unsubscribe plugin
const autoUnsubscribePlugin = {
  then: (unsubscribe) => {
    // Automatically unsubscribe after 5 seconds
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

// Automatically unsubscribes after 5 seconds
setTimeout(() => {
  stream$.next('timeout') // No output, already unsubscribed
}, 6000)
```

### Scenario 2: Vue component lifecycle integration

```typescript
import { getCurrentScope, onScopeDispose } from 'vue'
import { $ } from 'fluth'

// Vue component auto-cleanup plugin
const vueLifecyclePlugin = {
  then: (unsubscribe) => {
    // Automatically cleanup within Vue component scope
    if (getCurrentScope()) {
      onScopeDispose(() => {
        console.log('Vue component destroyed, auto-unsubscribed')
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
    console.log('Processed result:', data)
    return data
  })

stream$.next('hello') // Output: Processed result: HELLO
// All subscriptions are automatically cleaned up when the component is destroyed
```

### Scenario 3: Conditional unsubscription

```typescript
import { $ } from 'fluth'

// Conditional unsubscribe plugin
const conditionalUnsubscribePlugin = {
  then: (unsubscribe, observable) => {
    // Listen for a specific condition
    const checkCondition = () => {
      // Assume there is a global state
      if (window.appState?.shouldStopProcessing) {
        console.log('Detected stop condition, unsubscribing')
        unsubscribe()
      }
    }

    // Check the condition every second
    const intervalId = setInterval(checkCondition, 1000)

    // Cleanup timer when node is unsubscribed
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
// When window.appState.shouldStopProcessing = true, will automatically stop
```
