<script setup>
import Stream from '../../components/stream.vue'
</script>

# Stream

`Stream` inherits from [`Observable`](/en/api/observable). In addition to the properties and methods of `Observable`, the following methods are added:

<Stream />

## next

- Type

  ```typescript
  next(payload: any, finishFlag?: boolean): void;
  ```

- Details

  - Pushes data to the current stream. When `payload` is `Promise.reject(xxx)`, subsequent `then` behavior is consistent with `promise`'s `then`.
  - The second parameter indicates whether the current stream is finished. When set to `true`, subsequent `set` and `next` will not execute, and after the stream completes each node, it will trigger the node's `afterComplete` callback function, then automatically call the node's `unsubscribe` method.

- Example
  ```typescript
  import { $ } from "fluth";
  const promise$ = $("1");
  promise$.then((value) => {
    console.log(value);
  });
  promise$.next("2"); // prints 2
  ```

## set

- Type
  ```typescript
    set(setter: (value: T) => void, finishFlag?: boolean): void;
  ```
- Details

  Pushes data to the current stream. The difference from `next` is that `set` accepts a `setter` (which can be synchronous or asynchronous) and pushes a new `immutable` data. The second parameter indicates whether the current stream is finished. When set to `true`, subsequent `set` and `next` will not execute.

- Example

  ```typescript
  import { $ } from "fluth";
  const promise$ = $({ a: 1, b: { c: 2 } });
  const oldValue = promise$.value;
  promise$.then((value) => {
    console.log(value);
  });
  promise$.set((value) => {
    value.a = 2;
  }); // prints { a: 1, b: { c: 3 } }

  const newValue = promise$.value;
  console.log(oldValue === newValue); // prints false
  console.log(oldValue.b === newValue.b); // prints true
  ```

## use

- Type

  `plugin` type

  ```typescript
  type thenPlugin = (unsubscribe: () => void) => void
  type executePlugin = <T>(params: {
    result: Promise<T> | T
    set: (setter: (value: T) => Promise<void> | void) => Promise<T> | T
    root: boolean
    onfulfilled?: OnFulfilled
    onrejected?: OnRejected
    unsubscribe: () => void
  }) => Promise<any> | any

  type plugin: {
    then?: thenPlugin | thenPlugin[]
    thenAll?: thenPlugin | thenPlugin[]
    execute?: executePlugin | executePlugin[]
    executeAll?: executePlugin | executePlugin[]
  }
  ```

  `use` type

  ```typescript
  use<P extends Plugin>(plugin: P): Stream<T, I, E & ChainReturn<P, T, E>> & E & ChainReturn<P, T, E>;
  ```

- Details

  Calling `use` allows you to use four types of plugins: `then` plugins, `execute` plugins, `thenAll` plugins, and `executeAll` plugins:

  - `then` plugins are executed when the [then](/en/api/observable#then) method is called. They take the current node's `unsubscribe` function as a parameter and can implement unified unsubscription functionality.
  - `execute` plugins are executed when the [execute](/en/api/observable#then) method is called. They take the current node's execution result, a `set` function that can generate `immutable` data, and the current node's `unsubscribe` function as parameters. The returned `promise` will be passed to the next `execute` plugin, and the final returned `promise` data will be passed to the next `then` node.
  - `thenAll` plugins are triggered during all `then` operations of the root stream and all its child nodes, can only be used on root streams, child nodes cannot use them.
  - `executeAll` plugins are triggered during all `execute` operations of the root stream and all its child nodes, can only be used on root streams, child nodes cannot use them.

- Example

  ```typescript
  import { $, delay } from "fluth";

  const promise$ = $("1").use(delay);
  promise$.delay(1000).then((value) => {
    console.log(value);
  });

  promise$.next("2"); // prints 2 after 1s
  ```

## remove

- Type

  ```typescript
    interface PluginParams {
        then?: thenPlugin | thenPlugin[];
        thenAll?: thenPlugin | thenPlugin[];
        execute?: executePlugin | executePlugin[];
        executeAll?: executePlugin | executePlugin[];
    }
    remove(plugin: PluginParams | PluginParams[]): void;
  ```

- Details

  Removes the specified `plugin`. The `plugin` can be `then`, `execute`, `thenAll`, or `executeAll` plugins.

- Example
  ```typescript
  import { $, console } from "fluth";
  const promise$ = $("1").use(console);
  promise$.next("2"); // prints 2
  promise$.remove(console);
  promise$.next("3"); // doesn't print 3
  ```

## pause

- Type

  ```typescript
  pause: () => void
  ```

- Details

  Pauses the current stream. After executing the `pause` method, all subscribed nodes will not execute.

- Example

  ```typescript
  import { $, console } from "fluth";

  const promise$ = $("1");
  promise$.then((value) => {
    console.log(value);
  });

  promise$.next("2"); // prints 2
  promise$.pause();
  promise$.next("3"); // doesn't print 3
  ```

## restart

- Type

  ```typescript
  restart: () => void
  ```

- Details

  Restarts the current stream. After executing the `restart` method, all subscribed nodes start accepting and executing stream pushes.

- Example

  ```typescript
  import { $, console } from "fluth";

  const promise$ = $("1");
  promise$.then((value) => {
    console.log(value);
  });

  promise$.pause();
  promise$.next("2"); // doesn't print 2
  promise$.restart();
  promise$.next("3"); // prints 3
  ```
