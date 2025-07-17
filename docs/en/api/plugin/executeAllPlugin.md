# executeAllPlugin

Global execution plugin, executes on every node in the stream chain when processing data, used for global monitoring and handling of the data flow execution process.

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

- `result`: The execution result of the current node (can be a Promise or a synchronous value)
- `set`: Immutable state setter function, used to safely modify object state
- `root`: Whether it is the root node
- `status`: The status of the current node (`pending`, `resolved`, `rejected`)
- `onfulfilled`: Success handler function of the current node
- `onrejected`: Error handler function of the current node
- `unsubscribe`: Unsubscribe function

## Return Value

Returns the processed result, can be a synchronous value or a Promise. If the return value is not `undefined`, it will replace the original result.

## Execution Mechanism

From the source code, the execution logic of executeAll plugins is as follows:

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

- Merges the `executeAll` plugins of the root node and the `execute` plugins of the current node
- Uses `reduce` to execute plugins from left to right
- Each plugin receives the result of the previous plugin as input

## Core Behavior

- **Global execution**: Executes on every node in the stream chain when processing data
- **Data handling**: Can modify, monitor, or record the data flowing through
- **Root node only**: Can only be used on the root Stream node; child nodes cannot use executeAll plugins
- **Chained processing**: Multiple executeAll plugins are executed in order, each receiving the result of the previous plugin

## Notes

1. **Root node only**: executeAll plugins can only be used on the root Stream node; using on child nodes will throw an error
2. **Return value affects data flow**: If the plugin returns a non-`undefined` value, it will replace the original result
3. **Promise handling**: Plugins can return a Promise for asynchronous operations
4. **Execution order**: Multiple executeAll plugins are executed in the order they are added
5. **Error handling**: Errors in plugins will interrupt the entire data flow, handle with care

## Relationship with Other Plugins

- **vs execute plugin**: executeAll executes on all nodes, execute plugin only on specific nodes
- **vs thenAll**: executeAll executes when data flows, thenAll executes when nodes are created
- **vs then plugin**: executeAll is global, then plugin is per node
- **Applicable scenarios**: executeAll is suitable for global data processing, monitoring, validation, etc., that need to intervene during data flow
