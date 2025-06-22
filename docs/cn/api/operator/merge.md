# merge

将输入的[ stream ](/cn/api/stream#stream)或者[ subjection ](/cn/api/stream#subjection)进行合并，返回一个新的流

![image](/merge.drawio.svg)

- 类型

  ```typescript
  type merge: (...args: (Stream | Subjection)[]) => Stream;
  ```

- 详情

  - 流的合并操作指的是按照时间顺序，只要有流推送数据，都会被推送到新的流
  - 所有输入的流取消订阅后，新的流也会取消订阅
  - 所有输入的流[ 结束 ](/cn/guide/base#结束)后，新的流也会结束

- 示例

  ```typescript
  import { $, merge } from "fluth";

  const stream1$ = $(1);
  const stream2$ = $("hello");
  const stream3$ = $(true);

  const merged$ = merge(stream1$, stream2$, stream3$);

  merged$.then((value) => console.log(value));
  console.log(merged$.value);
  // 打印： undefined

  stream1$.next(2);
  // 打印： 2
  stream2$.next("world");
  // 打印： world
  stream3$.next(false);
  // 打印： false
  stream1$.next(3);
  // 打印： 3
  ```
