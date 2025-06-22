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

- 示例

  ```typescript
  import { $, fork } from "fluth";

  const source$ = $("initial value");
  const fork$ = fork(source$);

  fork$.then((value) => {
    console.log("Forked value:", value);
  });

  console.log(fork$.value);
  // 打印: initial value
  source$.next("new value");
  // 打印: Forked value: new value
  fork$.next("new forked value");
  // 打印: Forked value: new forked value
  ```
