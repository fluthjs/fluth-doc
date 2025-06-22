# promiseRace

输入的[ stream ](/cn/api/stream#stream)或者[ subjection ](/cn/api/stream#subjection)进行竞争，返回一个新的流，`fork`最先推送数据的那个流

![image](/promiseRace.drawio.svg)

- 类型

  ```typescript
  type promiseRace: (...args: (Stream | Subjection)[]) => Stream;
  ```

- 详情

  - 输入的流取消订阅或者[结束](/cn/guide/base#结束)后，新的流也会取消订阅或者结束

- 示例

  ```typescript
  import { $, promiseRace } from "fluth";

  const stream1$ = $(1);
  const stream2$ = $("hello");
  const stream3$ = $(false);

  const promiseRace$ = promiseRace(stream1$, stream2$, stream3$);
  promiseRace$.then((value) => console.log(value));

  stream2$.next("world");
  // 打印："hello"
  stream3$.next(true);
  stream1$.next(3);
  stream2$.next("code");
  // 打印："code"
  ```
