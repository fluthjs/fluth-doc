# combine

将输入的[ stream ](/cn/api/stream#stream)或者[ subjection ](/cn/api/stream#subjection)进行结合，返回一个新的流

![image](/combine.drawio.svg)

- 类型

  ```typescript
  type combine: (...args: (Stream | Subjection)[]) => Stream;
  ```

- 详情

  - 所有输入的流都发出第一个数据后，新的流才会发出第一个数据
  - 所有输入的流取消订阅后，新的流也会取消订阅
  - 所有输入的流[ 结束 ](/cn/guide/base#结束)后，新的流也会结束

- 示例

  ```typescript
  import { $, combine } from "fluth";

  const stream1$ = $(1);
  const stream2$ = $("hello");
  const stream3$ = $(true);

  const combined$ = combine(stream1$, stream2$, stream3$);
  combined$.then((value) => console.log(value));
  console.log(combined$.value);
  // 打印： undefined

  stream1$.next(2);
  stream2$.next("world");
  stream3$.next(false);
  // 打印：[2， "world", false]

  stream1$.next(3);
  // 打印：[3， "world", false]

  stream3$.next(true);
  // 打印：[3， "world", true]
  ```
