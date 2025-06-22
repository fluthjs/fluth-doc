<script setup>
import Stream from '../../components/stream.vue'
import Observable from '../../components/observable.vue'
</script>

# Observable

<Observable />

`Observable`实例的`then`, `thenOnce`方法返回的还是[Observable](#observable)实例

## value

- 类型
  ```typescript
  value: T | undefined;
  ```
- 详情

  当前节点的数据

## then

- 类型

  ```typescript
  type OnFulfilled<T> = Parameters<Promise<T>['then']>[0]
  type OnRejected<T> = Parameters<Promise<T>['catch']>[0]

  then<T>(
    onFulfilled: OnFulfilled<T>,
    onRejected?: OnRejected<unknown>,
  ): Observable
  ```

- 详情

  `then`订阅者，用法和`promise`保持一致，返回订阅节点的[ Observable ](#observable)实例

- 示例

  ```typescript
  import { $ } from "fluth";

  const promise$ = $("1");
  const observable$ = promise$.then((value) => Number(value)); // 自动推导 observable.value 的类型为 number
  ```

## thenOnce

- 类型

  ```typescript
  type OnFulfilled<T> = Parameters<Promise<T>['then']>[0]
  type OnRejected<T> = Parameters<Promise<T>['catch']>[0]

  thenOnce<T>(
    onFulfilled: OnFulfilled<T>,
    onRejected?: OnRejected<unknown>,
  ): Observable
  ```

- 详情

  `thenOnce`相比`then`方法差异点在于一旦订阅节点执行后，订阅节点会自动取消订阅。

- 示例

  ```typescript
  import { $ } from "fluth";

  const promise$ = $("1");
  const observable$ = promise$.thenOnce((value) => console.log(value));
  promise$.next("2"); // 打印 2
  promise$.next("3"); // 不会打印 3
  ```

## thenImmediate

- 类型

  ```typescript
  type OnFulfilled<T> = Parameters<Promise<T>['then']>[0]
  type OnRejected<T> = Parameters<Promise<T>['catch']>[0]

  thenImmediate<T>(
    onFulfilled: OnFulfilled<T>,
    onRejected?: OnRejected<unknown>,
  ): Observable
  ```

- 详情

  `thenImmediate`相比`then`方法差异点在于

  - 如果父节点是`Stream`实例并且有初始值，则采用`thenImmediate`会立即触发订阅子节点的`execute`
  - 父订阅节点如果是`Observable`并且`execute`过，则采用`thenImmediate`会立即触发订阅子节点的`execute`

- 示例

  ```typescript
  import { $ } from "fluth";

  const promise$ = $("1");
  const observable$ = promise$.thenImmediate((value) => console.log(value)); // 打印 1
  ```

## $then

- 类型
  ```typescript
    $then(setter: (value: T) => void | Promise<void>): Observable<T extends PromiseLike<infer V> ? V : T, E> & E;
  ```
- 详情

  `$then`订阅者，不同于`then`订阅者，`$then`订阅者只能对数据进行`immutable`操作而且无法处理上一个节点的`reject`错误，返回订阅节点的[ Observable ](#observable)实例。

- 示例

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

- 类型
  ```typescript
    $thenOnce(setter: (value: T) => void | Promise<void>): Observable<T extends PromiseLike<infer V>? V : T, E> & E;
  ```
  `$thenOnce`相比`$then`方法差异点在于一旦订阅节点执行后，订阅节点会自动取消订阅。

## $thenImmediate

- 类型
  ```typescript
    $thenImmediate(setter: (value: T) => void | Promise<void>): Observable<T extends PromiseLike<infer V>? V : T, E> & E;
  ```
  `$thenImmediate`相比`$then`方法差异点在于父订阅节点如果`execute`过，则采用`$thenImmediate`会立即触发订阅子节点的`execute`。

## catch

- 类型

  ```typescript
  type OnRejected<T> = Parameters<Promise<T>['catch']>[0]

  catch(onRejected: OnRejected<unknown>): Observable
  ```

- 详情

  对订阅节点进行`catch`，用法和`promise`保持一致，返回订阅节点的[ Observable ](#observable)实例。

- 示例

  ```typescript
  import { $ } from "fluth";

  const promise$ = $();
  observable$ = promise$.catch((error) => {
    console.log(error);
  });
  promise$.next(Promise.reject("error")); // 打印 error
  ```

## finally

- 类型

  ```typescript
  type OnFinally<T> = Parameters<Promise<T>['finally']>[0]

  finally(onFinally: OnFinally<unknown>): Observable
  ```

- 详情

  对订阅节点进行`finally`，用法和`promise`保持一致，返回订阅节点的[ Observable ](#observable)实例

- 示例
  ```typescript
  import { $ } from "fluth";
  const promise$ = $();
  observable$ = promise$.finally(() => {
    console.log("finally");
  });
  promise$.next(1); // 打印 finally
  ```

## get

- 类型

  ```typescript
    get<F>(getter: (value: T | undefined) => F): Observable<F extends PromiseLike<infer V> ? V : F, E> & E;
  ```

  - `get`订阅者，订阅当前节点的数据的`getter`部分，会立即执行并获取`getter`的结果，后续仅当这部分的值发生变化时，才会推流到订阅的字节点
  - `getter`的结果为订阅节点的值，返回订阅节点的[ Observable ](#observable)实例。

- 示例

  ```typescript
  import { $ } from "fluth";

  const promise$ = $({ a: 1, b: { c: 2 } });
  // get 会立即执行
  const observable$ = promise$.get((value) => value.b);

  observable$.value; // { c: 2 }

  observable$.then((value) => console.log(value));

  promise$.set((value) => {
    value.a = 3;
  }); // 不打印

  promise$.set((value) => {
    value.b.c = 3;
  }); // 打印 { c: 3 }
  ```

## change

- 类型

  ```typescript
    change(getter: (value: T | undefined) => any): Observable
  ```

- 详情

  `change`订阅者，只有上一次推流数据的`getter`结果和当前推流数据的`getter`结果不相等，才会触发订阅节点的`execute`，返回订阅节点的[ Observable ](#observable)实例。

- 示例

  ```typescript
  import { $ } from "fluth";

  const promise$ = $({ a: 1, b: { c: 2 } });
  const observable$ = promise$.change((value) => value.b).then((value) => console.log(value));

  promise$.set((value) => {
    value.a = 3;
  }); // 不打印

  promise$.set((value) => {
    value.b.c = 3;
  }); // 打印 {a: 3, b: {c: 3}}
  ```

## filter

- 类型

  ```typescript
    filter(condition: (value: T) => boolean): Observable
  ```

- 详情

  `filter`订阅者，当前节点的数据满足`condition`时，才会触发订阅节点的`execute`，返回订阅节点的[ Observable ](#observable)实例。

- 示例

  ```typescript
  import { $ } from "fluth";

  const promise$ = $(1);
  const observable$ = promise$.filter((value) => value > 2).then((value) => console.log(value));
  promise$.next(2); // 不打印
  promise$.next(3); // 打印 3
  ```

## execute

- 类型

  ```typescript
  execute: () => void
  ```

- 详情

  主动执行当前节点，数据采用上一次流过该节点的数据，如果节点从来没有执行过，则不会执行。
  :::warning
  执行当前节点，当前节点`then`之后的节点也会执行，相当于在当前节点推流当前节点的老数据
  :::

- 示例

  ```typescript
  import { $ } from "fluth";

  const promise$ = $(1);
  const observable$ = promise$.then((value) => value + 1);
  observable$.then((value) => console.log(value + 1));

  observable$.execute(); // 不打印
  promise$.next(1); //  打印 3
  observable$.execute(); // 打印 3
  ```

## unsubscribe

- 类型

  ```typescript
  unsubscribe(): void
  ```

- 详情

  取消节点的订阅，不同于`promise`的无法取消，`stream`的订阅可以随时取消
  ::: warning 警告
  取消当前节点订阅，当前节点的`then`之后的节点也会全部取消订阅
  :::

- 示例

  ```typescript
  import { $ } from "fluth";

  const promise$ = $(1);
  const observable$ = promise$.then((value) => value + 1);
  observable$.then((value) => console.log(value + 1));

  promise$.next(2); // 打印 2

  observable$.unsubscribe();

  promise$.next(3); // 不打印
  ```

## afterUnsubscribe

- 类型

  ```typescript
  afterUnsubscribe(callback: () => void): void
  ```

- 详情

  设置取消节点订阅的回调函数

- 示例

  ```typescript
  import { $ } from "fluth";

  const promise$ = $(1);

  const observable$ = promise$.then((value) => value + 1);
  observable$.afterUnsubscribe(() => {
    console.log("unsubscribe");
  });

  observable$.unsubscribe(); // 打印 unsubscribe
  ```

## offUnsubscribe

- 类型

  ```typescript
  offUnsubscribe(callback: () => void): void
  ```

- 详情

  取消通过`afterUnsubscribe`设置的回调函数

## afterComplete

- 类型

  ```typescript
    afterComplete(callback: (value: T, status: PromiseStatus) => void): void;
  ```

- 详情

  流结束后触发的回调函数，会早于订阅节点自动取消订阅触发

- 示例

  ```typescript
  import { $ } from "fluth";
  const promise$ = $(1);
  const observable$ = promise$.then((value) => console.log(value));

  observable$.afterComplete(() => console.log("complete"));
  observable$.afterUnsubscribe(() => console.log("unsubscribe"));

  promise$.next(2, true); // 打印 2 complete unsubscribe
  ```

## offComplete

- 类型

  ```typescript
  offComplete(callback: (value: T, status: PromiseStatus) => void): void
  ```

- 详情

  取消通过`afterComplete`设置的回调函数
