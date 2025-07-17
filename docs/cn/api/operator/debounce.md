# debounce

防抖操作符，延迟推送数据，直到指定时间内没有新的数据推送时才执行。

- 类型

  ```typescript
  type debounce = (debounceTime: number) => (observable$: Observable) => Observable;
  ```

- 详情

  - 接收一个防抖时间参数（毫秒）
  - 返回一个函数，该函数接收一个 Observable 并返回一个新的 Observable
  - 新 Observable 会在指定时间内没有新数据推送时才推送数据
  - 使用 setTimeout 实现防抖功能
  - 当流取消订阅时，会清理定时器
  - 第一次推送不会立即执行，会等待防抖时间

- 示例

  ```typescript
  import { $, debounce } from "fluth";

  const stream$ = $(1);

  // 使用 debounce 操作符，防抖时间 500ms
  const debounced$ = stream$.pipe(debounce(500));

  debounced$.then((value) => {
    console.log("防抖后的值:", value);
  });

  // 快速连续推送数据
  stream$.next(2);
  stream$.next(3);
  stream$.next(4);
  stream$.next(5);

  // 输出：等待 500ms 后只输出最后一次推送的值
  // 防抖后的值: 5
  ```

- 与其他 API 的关系

  - 与 `debounce` 插件的区别：`debounce` 是操作符，插件版本是 `chain` 插件
  - 操作符版本通过 `pipe` 使用，插件版本通过 `use` 使用
  - 常用于搜索输入、窗口调整等场景
