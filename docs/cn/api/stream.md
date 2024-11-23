<script setup>
import Stream from '../../components/stream.vue'
import Subjection from '../../components/subjection.vue'
</script>

# 预览

[[toc]]

## Stream

<Stream />

`Stream`实例的`then`, `thenOnce`方法返回的是[Subjection](#subjection)实例

## Subjection

<Subjection />

`Subjection`实例的`then`, `thenOnce`方法返回的还是[Subjection](#subjection)实例

## plugin

- Type

  ```typescript
  type thenPlugin = (unsubscribe: () => void) => void
  type executePlugin = ( promise: Promise<any>, unsubscribe: () => void ) => Promise<any>

  plugin: {
    then: thenPlugin[]
    execute: executePlugin[]
  }
  ```

- Details

  `plugin` 可以定义两种插件: `then`插件和`execute`插件：

  - `then`插件在[then](#then)方法被调用时执行。它们将当前节点的`unsubscribe`函数作为参数，可以实现统一的取消订阅功能。
  - `execute`插件在[execute](#execute)方法被调用时执行。它们将当前节点的`promise`和当前节点的`unsubscribe`函数作为参数，返回的`promise`将被传递给下一个`execute`插件，最终返回的`promise`数据将传递给下一个的`then`节点。

## then

- 类型

  ```typescript
  type OnFulfilled<T> = Parameters<Promise<T>['then']>[0]
  type OnRejected<T> = Parameters<Promise<T>['catch']>[0]

  then<T>(
    onFulfilled: OnFulfilled<T>,
    onRejected?: OnRejected<unknown>,
  ): Subjection
  ```

- 详情

  `then`订阅者，用法和`promise`保持一致，返回订阅节点的[ Subjection ](#subjection)实例

## thenOnce

- 类型

  ```typescript
  type OnFulfilled<T> = Parameters<Promise<T>['then']>[0]
  type OnRejected<T> = Parameters<Promise<T>['catch']>[0]

  thenOnce<T>(
    onFulfilled: OnFulfilled<T>,
    onRejected?: OnRejected<unknown>,
  ): Subjection
  ```

## thenImmediate

- 类型

  ```typescript
  type OnFulfilled<T> = Parameters<Promise<T>['then']>[0]
  type OnRejected<T> = Parameters<Promise<T>['catch']>[0]

  thenImmediate<T>(
    onFulfilled: OnFulfilled<T>,
    onRejected?: OnRejected<unknown>,
  ): Subjection
  ```

- 详情

  `thenImmediate`相比`then`方法差异点在于父订阅节点如果`execute`过，则采用`thenImmediate`会立即触发订阅子节点的`execute`

## catch

- 类型

  ```typescript
  type OnRejected<T> = Parameters<Promise<T>['catch']>[0]

  catch(onRejected: OnRejected<unknown>): Subjection
  ```

- 详情

  对订阅节点进行`catch`，用法和`promise`保持一致，返回订阅节点的[ Subjection ](#subjection)实例

## finally

- 类型

  ```typescript
  type OnFinally<T> = Parameters<Promise<T>['finally']>[0]

  finally(onFinally: OnFinally<unknown>): Subjection
  ```

- 详情

  对订阅节点进行`finally`，用法和`promise`保持一致，返回订阅节点的[ Subjection ](#subjection)实例

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

## setUnsubscribeCallback

- 类型

  ```typescript
  setUnsubscribeCallback(callback: () => void): void
  ```

- 详情

  设置取消节点订阅的回调函数

## finish

- 类型

  ```typescript
  finish: Promise<any>;
  ```

- 详情

  流结束后触发的`promise`，会早于订阅节点自动取消订阅触发

## execute

- 类型

  ```typescript
  execute: () => void
  ```

- 详情

  主动执行当前节点，数据采用上一次流过该节点的数据，如果节点从来没有执行过，则不会执行。
  :::warning
  执行当前节点，当前节点`then`之后的节点也会执行，相当于在当前节点推流
  :::

## pause

- 类型

  ```typescript
  pause: () => void
  ```

- 详情

  暂停当前流，执行`pause`方法后，所有订阅的节点都不会执行

## restart

- 类型

  ```typescript
  restart: () => void
  ```

- 详情

  重启当前流，执行`restart`方法后，所有订阅的节点开始接受流的推送并执行

## next

- 类型

  ```typescript
  next(payload: any, finishFlag?: boolean): void;
  ```

- 详情

  当前流推送数据，`payload`为数据，当设置为`Promise.reject(xxx)`时，后续`then`表现和`promise`的`then`一致；第二个参数代表当前流是否结束，当设置为`true`后续`next`将不再执行
