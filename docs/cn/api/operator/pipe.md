# pipe

从输入的[ stream ](/cn/api/stream#stream)或者[ subjection ](/cn/api/stream#subjection)中生成一个新订阅节点

- 类型

  ```typescript
  type fork = (arg$: Stream | Subjection) => Subjection;
  ```

- 详情

  - 流的订阅操作，返回一个新的订阅节点
  - 输入的流取消订阅后，新的订阅节点也会取消订阅
  - 输入的流[ 结束 ](/cn/guide/base#结束)后，新的订阅节点也会结束
