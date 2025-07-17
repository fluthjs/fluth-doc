# pipe

从输入的[ stream ](/cn/api/stream#stream)或者[ subjection ](/cn/api/stream#subjection)中创建一个新的订阅节点

- 类型

  ```typescript
  type pipe = (arg$: Stream | Subjection) => Subjection;
  ```

- 详情

  - 流的订阅操作，返回一个新的订阅节点
  - 输入的流取消订阅后，新的订阅节点也会取消订阅
  - 输入的流[ 完成 ](/cn/guide/base#完成)后，新的订阅节点也会完成
