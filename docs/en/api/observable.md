<script setup>
import Stream from '../../components/stream.vue'
import Observable from '../../components/observable.vue'
</script>

# Observable

<Observable />

The `then` and `thenOnce` methods of an `Observable` instance return [Observable](#observable) instances

## value

- Type
  ```typescript
  value: T | undefined;
  ```
- Details

  The data of the current node

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

  `then` subscriber, usage consistent with `promise`, returns an [Observable](#observable) instance of the subscription node

- Example

  ```typescript
  import { $ } from "fluth";

  const promise$ = $("1");
  const observable$ = promise$.then((value) => Number(value)); // automatically infers observable.value type as number
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

  The difference between `thenOnce` and `then` is that once the subscription node executes, it automatically unsubscribes.

- Example

  ```typescript
  import { $ } from "fluth";

  const promise$ = $("1");
  const observable$ = promise$.thenOnce((value) => console.log(value));
  promise$.next("2"); // prints 2
  promise$.next("3"); // won't print 3
  ```

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

  The differences between `thenImmediate` and `then` are:

  - If the parent node is a `Stream` instance with an initial value, using `thenImmediate` will immediately trigger the subscription child node's `execute`
  - If the parent subscription node is an `Observable` and has been `execute`d, using `thenImmediate` will immediately trigger the subscription child node's `execute`

- Example

  ```typescript
  import { $ } from "fluth";

  const promise$ = $("1");
  const observable$ = promise$.thenImmediate((value) => console.log(value)); // prints 1
  ```

## $then

- Type
  ```typescript
    $then(setter: (value: T) => void | Promise<void>): Observable<T extends PromiseLike<infer V> ? V : T, E> & E;
  ```
- Details

  `$then` subscriber, unlike the `then` subscriber, `$then` subscriber can only perform `immutable` operations on data and cannot handle `reject` errors from the previous node. Returns an [Observable](#observable) instance of the subscription node.

- Example

  ```typescript
  import { $ } from "fluth";

  const promise$ = $<{ a: number; b: { c: number } }>();
  const observable$ = promise$.$then((value) => {
    value.a = value.a + 1;
  });

  promise$.next({ a: 1, b: { c: 1 } });
  // observable$.value === { a: 2, b: { c: 1 } }
  promise$.value.b === observable$.value.b; // true
  ```

## $thenOnce

- Type
  ```typescript
    $thenOnce(setter: (value: T) => void | Promise<void>): Observable<T extends PromiseLike<infer V>? V : T, E> & E;
  ```
  The difference between `$thenOnce` and `$then` is that once the subscription node executes, it automatically unsubscribes.

## $thenImmediate

- Type
  ```typescript
    $thenImmediate(setter: (value: T) => void | Promise<void>): Observable<T extends PromiseLike<infer V>? V : T, E> & E;
  ```
  The difference between `$thenImmediate` and `$then` is that if the parent subscription node has been `execute`d, using `$thenImmediate` will immediately trigger the subscription child node's `execute`.

## catch

- Type

  ```typescript
  type OnRejected<T> = Parameters<Promise<T>['catch']>[0]

  catch(onRejected: OnRejected<unknown>): Observable
  ```

- Details

  Performs `catch` on the subscription node, usage consistent with `promise`, returns an [Observable](#observable) instance of the subscription node.

- Example

  ```typescript
  import { $ } from "fluth";

  const promise$ = $();
  observable$ = promise$.catch((error) => {
    console.log(error);
  });
  promise$.next(Promise.reject("error")); // prints error
  ```

## finally

- Type

  ```typescript
  type OnFinally<T> = Parameters<Promise<T>['finally']>[0]

  finally(onFinally: OnFinally<unknown>): Observable
  ```

- Details

  Performs `finally` on the subscription node, usage consistent with `promise`, returns an [Observable](#observable) instance of the subscription node

- Example
  ```typescript
  import { $ } from "fluth";
  const promise$ = $();
  observable$ = promise$.finally(() => {
    console.log("finally");
  });
  promise$.next(1); // prints finally
  ```

## get

- Type

  ```typescript
    get<F>(getter: (value: T | undefined) => F): Observable<F extends PromiseLike<infer V> ? V : F, E> & E;
  ```

  - `get` subscriber subscribes to the `getter` portion of the current node's data. It executes immediately and obtains the `getter`'s result. Subsequently, it only pushes to subscribed child nodes when this portion's value changes
  - The `getter`'s result becomes the subscription node's value, returns an [Observable](#observable) instance of the subscription node.

- Example

  ```typescript
  import { $ } from "fluth";

  const promise$ = $({ a: 1, b: { c: 2 } });
  // get executes immediately
  const observable$ = promise$.get((value) => value.b);

  observable$.value; // { c: 2 }

  observable$.then((value) => console.log(value));

  promise$.set((value) => {
    value.a = 3;
  }); // doesn't print

  promise$.set((value) => {
    value.b.c = 3;
  }); // prints { c: 3 }
  ```

## change

- Type

  ```typescript
    change(getter: (value: T | undefined) => any): Observable
  ```

- Details

  `change` subscriber only triggers the subscription node's `execute` when the `getter` result of the previous stream data is not equal to the `getter` result of the current stream data. Returns an [Observable](#observable) instance of the subscription node.

- Example

  ```typescript
  import { $ } from "fluth";

  const promise$ = $({ a: 1, b: { c: 2 } });
  const observable$ = promise$.change((value) => value.b).then((value) => console.log(value));

  promise$.set((value) => {
    value.a = 3;
  }); // doesn't print

  promise$.set((value) => {
    value.b.c = 3;
  }); // prints {a: 3, b: {c: 3}}
  ```

## filter

- Type

  ```typescript
    filter(condition: (value: T) => boolean): Observable
  ```

- Details

  `filter` subscriber only triggers the subscription node's `execute` when the current node's data satisfies the `condition`. Returns an [Observable](#observable) instance of the subscription node.

- Example

  ```typescript
  import { $ } from "fluth";

  const promise$ = $(1);
  const observable$ = promise$.filter((value) => value > 2).then((value) => console.log(value));
  promise$.next(2); // doesn't print
  promise$.next(3); // prints 3
  ```

## execute

- Type

  ```typescript
  execute: () => void
  ```

- Details

  Actively executes the current node, using data from the last time the stream passed through this node. If the node has never been executed before, it won't execute.
  :::warning
  Executing the current node will also execute nodes after the current node's `then`, equivalent to pushing the stream at the current node with the current node's old data
  :::

- Example

  ```typescript
  import { $ } from "fluth";

  const promise$ = $(1);
  const observable$ = promise$.then((value) => value + 1);
  observable$.then((value) => console.log(value + 1));

  observable$.execute(); // doesn't print
  promise$.next(1); //  prints 3
  observable$.execute(); // prints 3
  ```

## unsubscribe

- Type

  ```typescript
  unsubscribe(): void
  ```

- Details

  Cancels the node's subscription. Unlike `promise`'s inability to cancel, `stream`'s subscription can be canceled at any time
  ::: warning Warning
  Canceling the current node's subscription will also cancel all subscriptions of nodes after the current node's `then`
  :::

- Example

  ```typescript
  import { $ } from "fluth";

  const promise$ = $(1);
  const observable$ = promise$.then((value) => value + 1);
  observable$.then((value) => console.log(value + 1));

  promise$.next(2); // prints 2

  observable$.unsubscribe();

  promise$.next(3); // doesn't print
  ```

## setUnsubscribeCallback

- Type

  ```typescript
  setUnsubscribeCallback(callback: () => void): void
  ```

- Details

  Sets the callback function for when the node's subscription is canceled

- Example

  ```typescript
  import { $ } from "fluth";

  const promise$ = $(1);

  const observable$ = promise$.then((value) => value + 1);
  observable$.setUnsubscribeCallback(() => {
    console.log("unsubscribe");
  });

  observable$.unsubscribe(); // prints unsubscribe
  ```

## complete

- Type

  ```typescript
    complete(callback: (value: T, status: PromiseStatus) => void): void;
  ```

- Details

  Callback function triggered when the stream ends, will trigger earlier than the automatic unsubscription of subscription nodes

- Example

  ```typescript
  import { $ } from "fluth";
  const promise$ = $(1);
  const observable$ = promise$.then((value) => console.log(value));

  observable$.complete(() => console.log("complete"));
  observable$.setUnsubscribeCallback(() => console.log("unsubscribe"));

  promise$.next(2, true); // prints 2 complete unsubscribe
  ```
