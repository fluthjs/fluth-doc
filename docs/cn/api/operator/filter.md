# filter

过滤操作符，根据条件函数过滤数据，只推送满足条件的数据。

- 类型

  ```typescript
  type filter = <T>(condition: (value: T) => boolean) => (observable$: Observable<T>) => Observable<T>;
  ```

- 详情

  - 接收一个条件函数参数，该函数接收数据值并返回布尔值
  - 返回一个函数，该函数接收一个 Observable 并返回一个新的 Observable
  - 新 Observable 只会推送满足条件的数据
  - 条件函数返回 `true` 时推送数据，返回 `false` 时跳过
  - 使用 Observable 的 `then` 方法的第三个参数（条件函数）实现过滤

- 示例

  ```typescript
  import { $, filter } from "fluth";

  const stream$ = $(1);

  // 使用 filter 操作符，只接收大于 2 的数据
  const filtered$ = stream$.pipe(filter((value) => value > 2));

  filtered$.then((value) => {
    console.log("过滤后的值:", value);
  });

  // 推送数据
  stream$.next(1); // 不满足条件，跳过，不输出
  stream$.next(2); // 不满足条件，跳过，不输出
  stream$.next(3); // 满足条件，输出: 过滤后的值: 3
  stream$.next(4); // 满足条件，输出: 过滤后的值: 4
  stream$.next(1); // 不满足条件，跳过，不输出
  ```

- 与其他 API 的关系

  - 与 Observable 的 `filter` 方法的区别：操作符版本可以独立使用，方法版本是链式调用
  - 操作符版本通过 `pipe` 使用
  - 常用于数据预处理和条件筛选
