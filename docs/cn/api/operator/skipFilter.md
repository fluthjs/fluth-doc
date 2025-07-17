# skipFilter

跳过过滤操作符，根据过滤函数决定是否跳过数据推送。

- 类型

  ```typescript
  type skipFilter = (filter: (time: number) => boolean) => (observable$: Observable) => Observable;
  ```

- 详情

  - 接收一个过滤函数参数，该函数接收当前推送次数并返回布尔值
  - 返回一个函数，该函数接收一个 Observable 并返回一个新的 Observable
  - 新 Observable 会根据过滤函数的返回值决定是否推送数据
  - 过滤函数返回 `true` 时推送数据，返回 `false` 时跳过
  - 使用计数器跟踪推送次数

- 示例

  ```typescript
  import { $, skipFilter } from "fluth";

  const stream$ = $(1);

  // 使用 skipFilter 操作符，只接收偶数次推送
  const filtered$ = stream$.pipe(skipFilter((time) => time % 2 === 0));

  filtered$.then((value) => {
    console.log("过滤后接收的值:", value);
  });

  // 推送数据
  stream$.next(2); // 第1次，跳过，不输出
  stream$.next(3); // 第2次，输出: 过滤后接收的值: 3
  stream$.next(4); // 第3次，跳过，不输出
  stream$.next(5); // 第4次，输出: 过滤后接收的值: 5
  ```

- 与其他 API 的关系

  - 与 `skipFilter` 插件的区别：`skipFilter` 是操作符，插件版本是 `chain` 插件
  - 操作符版本通过 `pipe` 使用，插件版本通过 `use` 使用
  - 比 `skip` 更灵活，可以根据复杂条件决定是否跳过
