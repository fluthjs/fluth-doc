# thenAllPlugin

Global then plugin that executes whenever a child node is created in the stream chain, used for global monitoring and handling of node creation, can only be used on `Stream` nodes.

## Type Definition

```typescript
thenAllPlugin: (unsubscribe: () => void, observable: Observable<T>) => void
```

## Parameters

- `unsubscribe`: Unsubscribe function, can be used to unsubscribe the current observer node
- `observable`: The newly created observer node instance

## Details

- **Global execution**: Executes whenever a child node is created via `then`, `catch`, or `finally` in the stream chain
- **Node creation timing**: Executes immediately after a new observer node is created
- **Root node only**: Can only be used on the root Stream node; child nodes cannot use thenAll plugins
- **Propagates to all child nodes**: thenAll plugins on the root node affect the creation of all child nodes in the chain

## Execution Mechanism

From the source code, the execution logic of thenAll plugins is as follows:

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

- Merges the `thenAll` plugins of the root node and the `then` plugins of the current node
- Executes each plugin in order, passing in the [unsubscribe](/en/guide/base.html#unsubscribe) function and the newly created observer node

## Notes

1. **Root node only**: thenAll plugins can only be used on the root Stream node; using on child nodes will throw an error
2. **Does not modify data flow**: thenAll plugins do not affect data propagation or processing
3. **Execution timing**: Executes immediately after each new node is created, not during data flow
4. **Unsubscribe**: Use the provided `unsubscribe` function to unsubscribe a specific node
5. **Performance consideration**: Avoid complex calculations in plugins, as they execute on every node creation
