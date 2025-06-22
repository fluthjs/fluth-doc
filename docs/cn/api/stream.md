<script setup>
import Stream from '../../components/stream.vue'
</script>

# Stream

`Stream`继承[`Observable`](/cn/api/observable)，除了`Observable`的属性和方法外，以下方法为新增

<Stream />

## next

- 类型

  ```typescript
  next(payload: any, finishFlag?: boolean): void;
  ```

- 详情

  - 当前流推送数据，`payload`为数据，当为`Promise.reject(xxx)`或者`Promise.reject(xxx)`时，后续`then`表现和`promise`的`then`一致；
  - 第二个参数代表当前流是否结束当设置为`true`后续`set`、`next`将不再执行，并且在流执行完每个节点后会触发节点的`afterComplete`回调函数，然后自动调用节点的`unsubscribe`方法

- 示例
  ```typescript
  import { $ } from "fluth";
  const promise$ = $("1");
  promise$.then((value) => {
    console.log(value);
  });
  promise$.next("2"); // 打印 2
  ```

## set

- 类型
  ```typescript
    set(setter: (value: T) => void, finishFlag?: boolean): void;
  ```
- 详情

  当前流推送数据数据，与`next`的区别是`set`接收一个`setter`（可以是同步或者是异步），推送一个新的`immutable`数据；第二个参数代表当前流是否结束，当设置为`true`后续`set`、`next`将不再执行

- 示例

  ```typescript
  import { $ } from "fluth";
  const promise$ = $({ a: 1, b: { c: 2 } });
  const oldValue = promise$.value;
  promise$.then((value) => {
    console.log(value);
  });
  promise$.set((value) => {
    value.a = 2;
  }); // 打印 { a: 1, b: { c: 3 } }

  const newValue = promise$.value;
  console.log(oldValue === newValue); // 打印 false
  console.log(oldValue.b === newValue.b); // 打印 true
  ```

## use

- 类型

  `plugin`类型

  ```typescript
  type thenPlugin = (unsubscribe: () => void) => void
  type ChainPluginFn<T extends Observable = Observable> = (observer: T) => Record<string, any>
  type executePlugin = <T>(params: {
    result: Promise<T> | T
    set: (setter: (value: T) => Promise<void> | void) => Promise<T> | T
    unsubscribe: () => void
  }) => Promise<any> | any

  type plugin: {
    then?: thenPluginFn | thenPluginFn[]
    execute?: executePlugin | executePlugin[]
    chain?: ChainPluginFn
  }
  ```

  `use`类型

  ```typescript
  use<P extends Plugin>(plugin: P): Stream<T, I, E & ChainReturn<P, T, E>> & E & ChainReturn<P, T, E>;
  ```

- 详情

  调用`use`可以使用三种插件: `then`插件、`execute`插件、`chain`插件：

  - `then`插件在[then](/cn/api/observable#then)方法被调用时执行。它们将当前节点的`unsubscribe`函数作为参数，可以实现统一的取消订阅功能。
  - `execute`插件在[execute](/cn/api/observable#then)方法被调用时执行。它们将当前节点的执行结果、可以生成`immutables`数据的`set`函数、当前节点的`unsubscribe`函数作为参数，返回的`promise`将被传递给下一个`execute`插件，最终返回的`promise`数据将传递给下一个的`then`节点。
  - `chain`插件能够对当前流的链式操作上添加新的属性和方法。

- 示例

  ```typescript
  import { $, delay } from "fluth";

  const promise$ = $("1").use(delay);
  promise$.delay(1000).then((value) => {
    console.log(value);
  });

  promise$.next("2"); // 1s后打印 2
  ```

## remove

- 类型

  ```typescript
    interface ThenOrExecutePlugin {
        then?: thenPluginFn | thenPluginFn[];
        execute?: executePlugin | executePlugin[];
    }
    remove(plugin: ThenOrExecutePlugin | ThenOrExecutePlugin[]): void;
  ```

- 详情

  移除指定的`plugin`，`plugin`只能是`then`插件或者`execute`插件

- 示例
  ```typescript
  import { $, console } from "fluth";
  const promise$ = $("1").use(console);
  promise$.next("2"); // 打印 2
  promise$.remove(console);
  promise$.next("3"); // 不打印 3
  ```

## pause

- 类型

  ```typescript
  pause: () => void
  ```

- 详情

  暂停当前流，执行`pause`方法后，所有订阅的节点都不会执行

- 示例

  ```typescript
  import { $, console } from "fluth";

  const promise$ = $("1");
  promise$.then((value) => {
    console.log(value);
  });

  promise$.next("2"); // 打印 2
  promise$.pause();
  promise$.next("3"); // 不打印 3
  ```

## restart

- 类型

  ```typescript
  restart: () => void
  ```

- 详情

  重启当前流，执行`restart`方法后，所有订阅的节点开始接受流的推送并执行

- 示例

  ```typescript
  import { $, console } from "fluth";

  const promise$ = $("1");
  promise$.then((value) => {
    console.log(value);
  });

  promise$.pause();
  promise$.next("2"); // 不打印 2
  promise$.restart();
  promise$.next("3"); // 打印 3
  ```
