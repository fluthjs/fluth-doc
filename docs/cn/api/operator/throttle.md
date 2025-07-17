# throttle

节流操作符，限制数据推送的频率，确保在指定时间间隔内只推送最后一次数据。

- 类型

  ```typescript
  type throttle = (throttleTime: number) => (observable$: Observable) => Observable;
  ```

- 详情

  - 接收一个节流时间参数（毫秒）
  - 返回一个函数，该函数接收一个 Observable 并返回一个新的 Observable
  - 新 Observable 会在指定时间间隔内只推送最后一次数据
  - 使用时间戳和 setTimeout 实现节流功能
  - 当流取消订阅时，会清理定时器

- 示例

  ```typescript
  import { $, throttle } from "fluth";

  const stream$ = $(1);

  // 使用 throttle 操作符，节流时间 300ms
  const throttled$ = stream$.pipe(throttle(300));

  throttled$.then((value) => {
    console.log("节流后的值:", value);
  });

  // 快速连续推送数据
  stream$.next(2);
  stream$.next(3);
  stream$.next(4);
  stream$.next(5);

  // 输出：只输出最后一次推送的值
  // 节流后的值: 5
  ```

- 与其他 API 的关系

  - 与 `throttle` 插件的区别：`throttle` 是操作符，插件版本是 `chain` 插件
  - 操作符版本通过 `pipe` 使用，插件版本通过 `use` 使用
  - 常用于处理用户输入等高频事件
