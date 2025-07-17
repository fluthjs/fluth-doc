# delay

延迟操作符，将输入流的数据延迟指定时间后推送给订阅节点。

- 类型

  ```typescript
  type delay = <T>(delayTime: number) => (observable$: Observable<T>) => Observable<T>;
  ```

- 详情

  - 接收一个延迟时间参数（毫秒）
  - 返回一个函数，该函数接收一个 Observable 并返回一个新的 Observable
  - 新 Observable 会将数据延迟指定时间后推送给订阅节点
  - 使用 Promise 和 setTimeout 实现延迟功能

- 示例

  ```typescript
  import { $, delay } from "fluth";

  const stream$ = $(1);

  // 使用 delay 操作符，延迟 1000ms
  const delayed$ = stream$.pipe(delay(1000));

  delayed$.then((value) => {
    console.log("延迟后的值:", value);
  });

  stream$.next(2);
  stream$.next(3);

  // 输出：
  // 延迟 1000ms 后输出: 延迟后的值: 2
  // 延迟 1000ms 后输出: 延迟后的值: 3
  ```

- 与其他 API 的关系

  - 与 `delayExec` 插件的区别：`delay` 是操作符，`delayExec` 是插件
  - 与 `delay` 插件的区别：操作符版本通过 `pipe` 使用，插件版本通过 `use` 使用
  - 支持链式调用
