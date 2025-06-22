# concat

将输入的[ stream ](/cn/api/stream#stream)或者[ subjection ](/cn/api/stream#subjection)按照顺序结合，返回一个新的流

![image](/concat.drawio.svg)

- 类型

  ```typescript
  type concat: (...args: (Stream | Subjection)[]) => Stream;
  ```

- 详情

  - 当前输入的流[ 结束 ](/cn/guide/base#结束)后，下一个输入的流推送的数据才会推送到新的流
  - 当前输入的流取消订阅后，新的流也会取消订阅

- 示例

  ```typescript
  import { $, concat } from "fluth";

  const stream1$ = $(1);
  const stream2$ = $("hello");

  const concat$ = concat(stream1$, stream2$);
  concat$.then((value) => console.log(value));
  console.log(concat$.value);
  // 打印： undefined

  stream1$.next(2);
  // 打印：2
  stream2$.next("world");
  stream1$.next(3, true);
  // 打印：3
  stream2$.next("word");
  // 打印：word
  ```
