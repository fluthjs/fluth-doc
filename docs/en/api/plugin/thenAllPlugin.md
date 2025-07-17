# thenAllPlugin

Global then plugin that executes every time a child node is created in the stream chain, used for global monitoring and handling of node creation processes.

## Type Definition

```typescript
thenAllPlugin: (unsubscribe: () => void, observable: Observable<T>) => void
```

## Parameters

- `unsubscribe`: Unsubscribe function to cancel the current observer node
- `observable`: The newly created observer node instance

## Return Value

No return value (`void`)

## Core Behavior

- **Global execution**: Executes every time a node calls `then`, `catch`, `finally`, etc. to create child nodes in the stream chain
- **Node creation timing**: Executes immediately after a new observer node is created
- **Root node only**: Can only be used on the root Stream node, child nodes cannot use thenAll plugins
- **Propagates to all child nodes**: The root node's thenAll plugin affects all child node creation in the entire stream chain

## Execution Mechanism

From the source code, the thenAll plugin execution logic:

```typescript
#runThenPlugin(observer: Observable) {
  const thenPlugins = this._root
    ? this._root.#plugin.thenAll.concat(this.#plugin.then)
    : this.#plugin.then
  thenPlugins.forEach((fn) => {
    safeCallback(fn)(() => observer.#unsubscribeObservable(), observer)
  })
}
```

- Merges the root node's `thenAll` plugins with the current node's `then` plugins
- Executes each plugin sequentially, passing the unsubscribe function and the newly created observer node

## Usage Scenarios

### Scenario 1: Global Node Monitoring

```typescript
import { $ } from 'fluth'

// Monitor all node creation globally
const globalMonitor = (unsubscribe, observable) => {
  console.log('New node created:', {
    hasParent: !!observable.parent,
    nodeId: Math.random().toString(36).substr(2, 9),
  })
}

const stream$ = $().use({ thenAll: globalMonitor })

// Every new node creation triggers monitoring
const step1$ = stream$.then((value) => value + 1)
const step2$ = step1$.then((value) => value * 2)
const step3$ = step2$.catch((error) => console.error(error))

stream$.next(5)
// Output:
// New node created: { hasParent: true, nodeId: "xyz123" }
// New node created: { hasParent: true, nodeId: "abc456" }
// New node created: { hasParent: true, nodeId: "def789" }
```

### Scenario 2: Automatic Error Handling

```typescript
import { $ } from 'fluth'

// Automatically add error handling to all nodes
const autoErrorHandler = (unsubscribe, observable) => {
  // Add error handling to each new node
  const originalCatch = observable.catch
  observable.catch = function (onRejected) {
    console.log('Adding error handling to node')
    return originalCatch.call(this, (error) => {
      console.error('Global error handling:', error)
      return onRejected ? onRejected(error) : Promise.reject(error)
    })
  }
}

const stream$ = $().use({ thenAll: autoErrorHandler })

const processed$ = stream$
  .then((value) => {
    if (value < 0) throw new Error('Negative number error')
    return value * 2
  })
  .then((value) => value + 10)

stream$.next(-5)
// Output:
// Adding error handling to node
// Adding error handling to node
// Global error handling: Error: Negative number error
```

### Scenario 3: Performance Monitoring

```typescript
import { $ } from 'fluth'

// Monitor creation and execution time of each node
const performanceMonitor = (unsubscribe, observable) => {
  const nodeId = Math.random().toString(36).substr(2, 9)
  const startTime = Date.now()

  console.log(`Node ${nodeId} creation time:`, startTime)

  // Monitor node completion time
  observable.afterComplete((value, status) => {
    const endTime = Date.now()
    console.log(`Node ${nodeId} completion time:`, endTime, `Duration: ${endTime - startTime}ms`)
  })
}

const stream$ = $().use({ thenAll: performanceMonitor })

const pipeline$ = stream$
  .then(async (value) => {
    await new Promise((resolve) => setTimeout(resolve, 100))
    return value * 2
  })
  .then(async (value) => {
    await new Promise((resolve) => setTimeout(resolve, 50))
    return value + 1
  })

stream$.next(10)
// Output:
// Node abc123 creation time: 1640000000000
// Node def456 creation time: 1640000000001
// Node abc123 completion time: 1640000000105 Duration: 105ms
// Node def456 completion time: 1640000000156 Duration: 155ms
```

### Scenario 4: Conditional Unsubscription

```typescript
import { $ } from 'fluth'

// Automatically unsubscribe certain nodes based on conditions
const conditionalUnsubscribe = (unsubscribe, observable) => {
  // Monitor node values, automatically unsubscribe when conditions are met
  observable.afterComplete((value, status) => {
    if (status === 'resolved' && value > 100) {
      console.log('Value too large, auto unsubscribing:', value)
      unsubscribe()
    }
  })
}

const stream$ = $().use({ thenAll: conditionalUnsubscribe })

const processed$ = stream$
  .then((value) => value * 10)
  .then((value) => {
    console.log('Processing value:', value)
    return value + 1
  })

stream$.next(5) // Normal processing: 50 -> 51
stream$.next(15) // Value too large, auto unsubscribe: 150
stream$.next(8) // Already unsubscribed, no longer processing
```

### Scenario 5: Debug Assistant

```typescript
import { $ } from 'fluth'

// Add debugging information for development environment
const debugHelper = (unsubscribe, observable) => {
  if (process.env.NODE_ENV === 'development') {
    const nodeDepth = observable.parent ? getNodeDepth(observable) : 0
    const indent = '  '.repeat(nodeDepth)

    console.log(`${indent}🔗 Create node (depth: ${nodeDepth})`)

    observable.afterComplete((value, status) => {
      const statusIcon = status === 'resolved' ? '✅' : '❌'
      console.log(`${indent}${statusIcon} Node completed:`, value)
    })

    observable.afterUnsubscribe(() => {
      console.log(`${indent}🗑️ Node unsubscribed`)
    })
  }
}

function getNodeDepth(observable) {
  let depth = 0
  let current = observable.parent
  while (current) {
    depth++
    current = current.parent
  }
  return depth
}

const stream$ = $().use({ thenAll: debugHelper })

const result$ = stream$
  .then((value) => value * 2)
  .then((value) => value + 10)
  .catch((error) => 'error handled')

stream$.next(5)
// Output:
// 🔗 Create node (depth: 1)
//   🔗 Create node (depth: 2)
//     🔗 Create node (depth: 3)
// ✅ Node completed: 5
//   ✅ Node completed: 10
//     ✅ Node completed: 20
```

## Important Notes

1. **Root node only**: thenAll plugins can only be used on the root Stream node, using on child nodes will throw an error
2. **Does not modify data flow**: thenAll plugins do not affect data transmission and processing
3. **Execution timing**: Executes immediately after each new node is created, not when data flows
4. **Unsubscription**: Can use the provided `unsubscribe` function to cancel specific node subscriptions
5. **Performance consideration**: Since it executes on every node creation, avoid complex computational operations

## Relationship with Other Plugins

- **vs then plugin**: thenAll executes on all node creation, then plugin only used on specific nodes
- **vs executeAll**: thenAll executes on node creation, executeAll executes on data flow
- **vs execute**: thenAll is global, execute is single-node
- **Use cases**: thenAll is suitable for global monitoring, debugging, performance analysis, and other scenarios that need to intervene during node creation

## Limitations

```typescript
// ❌ Error: Child nodes cannot use thenAll
const stream$ = $()
const child$ = stream$.then((value) => value + 1)
child$.use({ thenAll: somePlugin }) // Throws error

// ✅ Correct: Can only be used on root node
const stream$ = $().use({ thenAll: somePlugin })
```

## Practical Application Example

### Flow Monitoring System

```typescript
import { $ } from 'fluth'

interface NodeInfo {
  id: string
  depth: number
  createTime: number
  parent?: string
}

class FlowMonitor {
  private nodes: Map<string, NodeInfo> = new Map()

  createMonitorPlugin() {
    return (unsubscribe, observable) => {
      const nodeId = Math.random().toString(36).substr(2, 9)
      const parentId = observable.parent ? this.getNodeId(observable.parent) : undefined

      const nodeInfo: NodeInfo = {
        id: nodeId,
        depth: this.getNodeDepth(observable),
        createTime: Date.now(),
        parent: parentId,
      }

      this.nodes.set(nodeId, nodeInfo)
      observable._nodeId = nodeId // Store node ID

      console.log('📊 Flow monitoring:', {
        action: 'node_created',
        nodeId,
        parentId,
        depth: nodeInfo.depth,
        totalNodes: this.nodes.size,
      })

      observable.afterComplete((value, status) => {
        console.log('📊 Flow monitoring:', {
          action: 'node_completed',
          nodeId,
          status,
          value,
          duration: Date.now() - nodeInfo.createTime,
        })
      })

      observable.afterUnsubscribe(() => {
        this.nodes.delete(nodeId)
        console.log('📊 Flow monitoring:', {
          action: 'node_removed',
          nodeId,
          remainingNodes: this.nodes.size,
        })
      })
    }
  }

  private getNodeId(observable) {
    return observable._nodeId || 'unknown'
  }

  private getNodeDepth(observable) {
    let depth = 0
    let current = observable.parent
    while (current) {
      depth++
      current = current.parent
    }
    return depth
  }

  getFlowReport() {
    return Array.from(this.nodes.values())
  }
}

// Usage example
const monitor = new FlowMonitor()
const stream$ = $().use({ thenAll: monitor.createMonitorPlugin() })

const dataFlow$ = stream$
  .then((data) => ({ ...data, step: 'validation' }))
  .then((data) => ({ ...data, step: 'processing' }))
  .then((data) => ({ ...data, step: 'output' }))
  .catch((error) => ({ error: error.message, step: 'error_handling' }))

stream$.next({ id: 1, value: 'test' })

// Get flow report
setTimeout(() => {
  console.log('Flow report:', monitor.getFlowReport())
}, 1000)
```
