<script setup>
import Stream from '../../components/stream.vue'
import Observable from '../../components/observable.vue'
</script>

# Observable

<Observable />

Observable instances' then, thenOnce, thenImmediate, pipe methods all return Observable instances

## value

- Type
  ```typescript
  value: T | undefined
  ```
- Details

  The data of the current node

## status

- Type
  ```typescript
  enum PromiseStatus {
    PENDING = 'pending',
    RESOLVED = 'resolved',
    REJECTED = 'rejected',
  }
  status: PromiseStatus | null
  ```
- Details

  The status of the current node. Generally pending, fulfilled, rejected. When the stream has not passed through this node or the node has been [unsubscribed](/en/guide/base.html#unsubscribe), the status is null.

## then

- Type

  ```typescript
  type OnFulfilled<T> = Parameters<Promise<T>['then']>[0]
  type OnRejected<T> = Parameters<Promise<T>['catch']>[0]

  then<T>(
    onFulfilled: OnFulfilled<T>,
    onRejected?: OnRejected<unknown>,
  ): Observable
  ```

- Details

  then subscriber, usage consistent with promise, returns an [Observable](#observable) instance of the subscription node

- Example

  ```typescript
  import { $ } from 'fluth'

  const promise$ = $('1')
  const observable$ = promise$.then((value) => Number(value)) // automatically infers observable.value type as number
  ```

## thenSet

- Type
  ```typescript
    $then(setter: (value: T) => void | Promise<void>): Observable<T extends PromiseLike<infer V> ? V : T, E> & E;
  ```
- Details

  thenSet subscriber, unlike the then subscriber, thenSet subscriber can only perform immutable operations on data and cannot handle reject errors from the previous node. Returns an [Observable](#observable) instance of the subscription node.

- Example

  ```typescript
  import { $ } from 'fluth'

  const promise$ = $<{ a: number; b: { c: number } }>()
  const observable$ = promise$.$then((value) => {
    value.a = value.a + 1
  })

  promise$.next({ a: 1, b: { c: 1 } })
  // observable$.value === { a: 2, b: { c: 1 } }
  promise$.value.b === observable$.value.b // true
  ```

## thenOnce

- Type

  ```typescript
  type OnFulfilled<T> = Parameters<Promise<T>['then']>[0]
  type OnRejected<T> = Parameters<Promise<T>['catch']>[0]

  thenOnce<T>(
    onFulfilled: OnFulfilled<T>,
    onRejected?: OnRejected<unknown>,
  ): Observable
  ```

- Details

  The difference between thenOnce and then is that once the subscription node executes, it automatically unsubscribes.

- Example

  ```typescript
  import { $ } from 'fluth'

  const promise$ = $('1')
  const observable$ = promise$.thenOnce((value) => console.log(value))
  promise$.next('2') // prints 2
  promise$.next('3') // won't print 3
  ```

## thenOnceSet

- Type
  ```typescript
    $thenOnce(setter: (value: T) => void | Promise<void>): Observable<T extends PromiseLike<infer V>? V : T, E> & E;
  ```
  The difference between thenOnceSet and thenSet is that once the subscription node executes, it automatically unsubscribes.

## thenImmediate

- Type

  ```typescript
  type OnFulfilled<T> = Parameters<Promise<T>['then']>[0]
  type OnRejected<T> = Parameters<Promise<T>['catch']>[0]

  thenImmediate<T>(
    onFulfilled: OnFulfilled<T>,
    onRejected?: OnRejected<unknown>,
  ): Observable
  ```

- Details

  The differences between thenImmediate and then are:

  - If the parent node is a Stream instance with an initial value, using thenImmediate will immediately trigger the subscription child node's execute
  - If the parent subscription node is an Observable and has been executed, using thenImmediate will immediately trigger the subscription child node's execute

- Example

  ```typescript
  import { $ } from 'fluth'

  const promise$ = $('1')
  const observable$ = promise$.thenImmediate((value) => console.log(value)) // prints 1
  ```

## thenImmediateSet

- Type
  ```typescript
    $thenImmediate(setter: (value: T) => void | Promise<void>): Observable<T extends PromiseLike<infer V>? V : T, E> & E;
  ```
  The difference between thenImmediateSet and thenSet is that if the parent subscription node has been executed, using thenImmediateSet will immediately trigger the subscription child node's execute.

## catch

- Type

  ```typescript
  type OnRejected<T> = Parameters<Promise<T>['catch']>[0]

  catch(onRejected: OnRejected<unknown>): Observable
  ```

- Details

  Performs catch on the subscription node, usage consistent with promise, returns an [Observable](#observable) instance of the subscription node.

- Example

  ```typescript
  import { $ } from 'fluth'

  const promise$ = $()
  observable$ = promise$.catch((error) => {
    console.log(error)
  })
  promise$.next(Promise.reject('error')) // prints error
  ```

## finally

- Type

  ```typescript
  type OnFinally<T> = Parameters<Promise<T>['finally']>[0]

  finally(onFinally: OnFinally<unknown>): Observable
  ```

- Details

  Performs finally on the subscription node, usage consistent with promise, returns an [Observable](#observable) instance of the subscription node

- Example
  ```typescript
  import { $ } from 'fluth'
  const promise$ = $()
  observable$ = promise$.finally(() => {
    console.log('finally')
  })
  promise$.next(1) // prints finally
  ```

## pipe

- Type

  ```typescript
  pipe(operator: Operator): Observable
  ```

- Details

  Pipe the subscription node. The pipe method can chain multiple operators and returns an [Observable](#observable) instance

- Example

  ```typescript
  import { $, delay } from 'fluth'
  const promise$ = $()
  promise$.pipe(delay(1000)).then((value) => {
    console.log(value)
  })
  ```

## use

- Type

  plugin type

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

  use type

  ```typescript
  use<P extends Plugin>(plugin: P): Stream<T, I, E & ChainReturn<P, T, E>> & E & ChainReturn<P, T, E>;
  ```

- Details

  Calling use can use four types of plugins: then plugin, execute plugin, thenAll plugin, executeAll plugin:

  - then plugin executes when the [then](/en/api/observable#then) method is called. They take the current node's unsubscribe function as a parameter and can implement unified unsubscription functionality.
  - execute plugin executes when the [execute](/en/api/observable#execute) method is called. They take the current node's execution result, set function that can generate immutable data, and the current node's unsubscribe function as parameters. The returned promise will be passed to the next execute plugin, and the final returned promise data will be passed to the next then node.
  - thenAll plugin triggers when then operations occur on the root stream and all its child nodes, can only be used on the root stream, child nodes cannot use it.
  - executeAll plugin triggers when execute operations occur on the root stream and all its child nodes, can only be used on the root stream, child nodes cannot use it.

- Example

  ```typescript
  import { $, delay } from 'fluth'

  const promise$ = $('1').use(delay)
  promise$.delay(1000).then((value) => {
    console.log(value)
  })

  promise$.next('2') // outputs 2 after 1s
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

  Removes the specified plugin, plugin can be then, execute, thenAll, executeAll plugin

- Example
  ```typescript
  import { $, console } from 'fluth'
  const promise$ = $('1').use(console)
  promise$.next('2') // prints 2
  promise$.remove(console)
  promise$.next('3') // doesn't print 3
  ```

## execute

- Type

  ```typescript
  execute: () => void
  ```

- Details

  Actively executes the current node, using data from the last time the stream passed through this node. If the node has never been executed before, it won't execute.
  :::warning
  Executing the current node will also execute nodes after the current node's then, equivalent to pushing the stream at the current node with the current node's old data
  :::

- Example

  ```typescript
  import { $ } from 'fluth'

  const promise$ = $(1)
  const observable$ = promise$.then((value) => value + 1)
  observable$.then((value) => console.log(value + 1))

  observable$.execute() // doesn't print
  promise$.next(1) //  prints 3
  observable$.execute() // prints 3
  ```

## unsubscribe

- Type

  ```typescript
  unsubscribe(): void
  ```

- Details

  Cancels the node's subscription. Unlike promise's inability to cancel, stream's subscription can be canceled at any time
  ::: warning Warning
  Canceling the current node's subscription will also cancel all subscriptions of nodes after the current node's then
  :::

- Example

  ```typescript
  import { $ } from 'fluth'

  const promise$ = $(1)
  const observable$ = promise$.then((value) => value + 1)
  observable$.then((value) => console.log(value + 1))

  promise$.next(2) // prints 2

  observable$.unsubscribe()

  promise$.next(3) // doesn't print
  ```

## afterUnsubscribe

- Type

```typescript
  afterUnsubscribe(callback: () => void): void
```

- Details

  Sets the callback function when the node's subscription is canceled

- Example

  ```typescript
  import { $ } from 'fluth'

  const promise$ = $(1)

  const observable$ = promise$.then((value) => value + 1)
  observable$.afterUnsubscribe(() => {
    console.log('unsubscribe')
  })

  observable$.unsubscribe() // prints unsubscribe
  ```

## offUnsubscribe

- Type

```typescript
  offUnsubscribe(callback: () => void): void
```

- Details

  Cancels the callback function set through afterUnsubscribe

## afterComplete

- Type

```typescript
  afterComplete(callback: (value: T, status: PromiseStatus) => void): void
```

- Details

  Callback function triggered when the stream ends, will trigger earlier than the automatic unsubscription of subscription nodes

- Example

  ```typescript
  import { $ } from 'fluth'
  const promise$ = $(1)
  const observable$ = promise$.then((value) => console.log(value))

  observable$.afterComplete(() => console.log('complete'))
  observable$.afterUnsubscribe(() => console.log('unsubscribe'))

  promise$.next(2, true) // prints 2 complete unsubscribe
  ```

## offComplete

- Type

```typescript
  offComplete(callback: (value: T, status: PromiseStatus) => void): void
```

- Details

  Cancels the callback function set through afterComplete

## afterSetValue

- Type

```typescript
  afterSetValue(callback: (value: T) => void)
```

- Details
  Callback function triggered when the observable node modifies the node value

- Example

  ```typescript
  import { $ } from 'fluth'
  const promise$ = $(1)
  promise$.afterSetValue((value) => console.log(value))
  promise$.next(2) // prints 2
  ```

## offAfterSetValue

- Type

```typescript
  offAfterSetValue(callback: (value: T) => void): void
```

- Details

  Cancels the callback function set through afterSetValue
