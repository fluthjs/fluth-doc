# skip

跳过指定次数或满足条件的推流

- 类型

  ```typescript
  skip: (skipTime: number) => Observable;
  ```

  ```typescript
  skipFilter: (filter: (time: number) => boolean) => Observable;
  ```

- 详情

  - `skip(skipTime)`: 跳过前 `skipTime` 次推流，从第 `skipTime + 1` 次开始接收数据
  - `skipFilter(filter)`: 根据过滤函数决定是否跳过推流，`filter` 函数接收当前推流次数作为参数，返回 `true` 时接收数据，返回 `false` 时跳过

- 示例

  ```typescript
  import { $, skip } from "fluth";

  const stream$ = $(0).use(skip);

  // 跳过前2次推流
  const skipped$ = stream$.skip(2);
  skipped$.then((value) => console.log("skip:", value));

  // 使用过滤函数跳过
  const skipFiltered$ = stream$.skipFilter((time) => time > 3);
  skipFiltered$.then((value) => console.log("skipFilter:", value));

  stream$.next(1); // 不打印
  stream$.next(2); // 不打印
  stream$.next(3); // 打印: skip: 3
  stream$.next(4); // 打印: skip: 4, skipFilter: 4
  stream$.next(5); // 打印: skip: 5, skipFilter: 5
  ```
