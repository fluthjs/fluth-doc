# fork

从输入的[ stream ](/cn/api/stream#stream)或者[ subjection ](/cn/api/stream#subjection)中分流一条新的流，新的流会订阅输入的流

- 类型

  ```typescript
  type fork = (arg$: Stream | Subjection) => Stream;
  ```

- 详情

  - 流的分流操作，返回一个新的流
  - 输入的流取消订阅后，新的流也会取消订阅
  - 输入的流[ 结束 ](/cn/guide/base#结束)后，新的流也会结束

::: warning 和`pipe`的区别
`fork` 返回的是 `Stream`，`pipe` 返回的是 `Subjection`，意味着 `fork` 可以除了订阅了上游流，还可以主动发布数据
:::
