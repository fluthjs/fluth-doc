# partition

将输入的[ stream ](/cn/api/stream#stream)或者[ subjection ](/cn/api/stream#subjection)按照条件函数进行分区，返回两个流，第一个是满足条件的流，第二个是不满足条件的流

![image](/partition.drawio.svg)

- 类型

  ```typescript
  type partition: (
    stream$: Stream | Subjection,
    predicate: (this: any, value: any, index: number) => boolean,
    thisArg?: any,
  ) => Stream[];
  ```

- 详情

  - 将输入的流按照条件函数进行区分，返回两个流：第一个是满足条件的流，第二个是不满足条件的流
  - 输入的流取消订阅后，两个返回的流也会取消订阅
  - 输入的流[ 结束 ](/cn/guide/base#结束)后，对应返回的流也会结束

- 示例

  ```typescript
  import { $, partition } from "fluth";

  const stream$ = $(0);

  const [stream1$, stream2$] = partition(stream$, (value) => value % 2 === 0);

  stream1$.then((value) => console.log("first stream", value));
  stream2$.then((value) => console.log("second stream", value));

  stream$.next(1);
  // 打印 second stream 1
  stream$.next(2);
  // 打印 first stream 2
  stream$.next(3);
  // 打印 second stream 3
  stream$.next(4);
  // 打印 first stream 4
  ```
