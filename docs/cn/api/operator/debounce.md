# debounce

防抖操作符，延迟推送数据，直到指定时间内没有新的数据推送时才执行。

- 类型

  ```typescript
  type debounce = (debounceTime: number) => (observable$: Observable) => Observable
  ```

- 详情

  - 接收一个防抖时间参数（毫秒）
  - 第一次推送不会立即执行，会等待防抖时间

- 示例

  ```typescript
  import { $, debounce } from 'fluth'

  const stream$ = $(1)

  // 使用 debounce 操作符，防抖时间 500ms
  const debounced$ = stream$.pipe(debounce(500))

  debounced$.then((value) => {
    console.log('防抖后的值:', value)
  })

  // 快速连续推送数据
  stream$.next(2)
  stream$.next(3)
  stream$.next(4)
  stream$.next(5)

  // 输出：等待 500ms 后只输出最后一次推送的值
  // 防抖后的值: 5
  ```
