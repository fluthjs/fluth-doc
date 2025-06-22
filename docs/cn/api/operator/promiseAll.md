# promiseAll

将输入的[ stream ](/cn/api/stream#stream)或者[ subjection ](/cn/api/stream#subjection)进行组合，类似于 Promise.all 的行为，返回一个新的流

![image](/promiseAll.drawio.svg)

- 类型

  ```typescript
  type promiseAll: (...args: (Stream | Subjection)[]) => Stream;
  ```

- 详情

  - 所有输入的流都发出第一个数据后，新的流才会发出第一个数据
  - 当且仅当所有的输入流都推流新数据时，新的流才会发出新数据
  - 所有输入的流[ 结束 ](/cn/guide/base#结束)后，新的流也会结束
  - 所有输入的流取消订阅后，新的流也会取消订阅

- 示例

  ```typescript
  import { $, promiseAll } from "fluth";

  const stream1$ = $(1);
  const stream2$ = $("hello");
  const stream3$ = $(true);

  const promiseAll$ = promiseAll(stream1$, stream2$, stream3$);

  promiseAll$.then((value) => console.log(value));
  console.log(promiseAll$.value);
  // 打印： undefined

  stream1$.next(2);
  stream2$.next("world");
  stream3$.next(false);
  // 打印：[2， "hello", true]

  stream1$.next(3);
  stream1$.next(4);
  stream3$.next(true);
  stream2$.next("world");
  // 打印：[4， "world", true]
  ```
