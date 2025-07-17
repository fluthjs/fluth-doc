# skip

跳过操作符，跳过指定次数的数据推送，从第 N+1 次开始接收数据。

- 类型

  ```typescript
  type skip = <T>(skipTime: number) => (observable$: Observable<T>) => Observable<T>;
  ```

- 详情

  - 接收一个跳过次数参数
  - 返回一个函数，该函数接收一个 Observable 并返回一个新的 Observable
  - 新 Observable 会跳过前 N 次数据推送，从第 N+1 次开始接收数据
  - 使用计数器实现跳过功能
  - 跳过次数达到后，后续所有数据都会正常推送

- 示例

  ```typescript
  import { $, skip } from "fluth";

  const stream$ = $(1);

  // 使用 skip 操作符，跳过前 2 次推送
  const skipped$ = stream$.pipe(skip(2));

  skipped$.then((value) => {
    console.log("跳过后接收的值:", value);
  });

  // 推送数据
  stream$.next(2); // 跳过，不输出
  stream$.next(3); // 跳过，不输出
  stream$.next(4); // 输出: 跳过后接收的值: 4
  stream$.next(5); // 输出: 跳过后接收的值: 5
  ```

- 与其他 API 的关系

  - 与 `skip` 插件的区别：`skip` 是操作符，插件版本是 `chain` 插件
  - 操作符版本通过 `pipe` 使用，插件版本通过 `use` 使用
  - 常用于忽略初始数据或跳过特定次数的推送
