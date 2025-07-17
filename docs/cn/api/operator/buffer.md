# buffer

缓冲操作符，将源流的数据收集到缓冲区中，当触发器流发出值时一次性输出所有缓冲的数据。

## 类型定义

```typescript
type buffer = <T>(
  trigger$: Stream | Observable,
  shouldAwait?: boolean
) => (observable$: Observable<T>) => Observable<T[]>
```

## 参数说明

- `trigger$` (Stream | Observable): 触发器流，当该流发出值时，buffer 操作符会发出所有缓冲的数据
- `shouldAwait` (boolean, 可选): 是否等待流的 `pending` 状态结束，默认为 `true`，当`trigger$`触发时，如果源流处于 `pending` 状态，会等待解析完成后再发出

## 返回值

返回一个新的 `Observable`，该 `Observable` 会将源流的数据收集到数组中，只在触发器激活时发出缓冲的数据数组。

## 详情

`buffer` 操作符的核心行为：

- **数据收集**：持续收集源流发出的已解析值到内部缓冲区
- **触发机制**：只有当触发器流发出值时，才会发出缓冲区中的所有数据
- **值过滤**：只收集已解析的值，忽略被拒绝的 Promise
- **缓冲清空**：每次发出数据后会清空缓冲区，准备收集下一批数据
- **等待机制**：当 `shouldAwait` 为 `true` 时，如果源流处于 pending 状态，会等待解析完成后再发出

## 使用场景

### 场景 1：基础数据缓冲

```typescript
import { $, buffer } from 'fluth'

const source$ = $()
const trigger$ = $()

const buffered$ = source$.pipe(buffer(trigger$))

buffered$.then((values) => {
  console.log('缓冲的数据:', values)
})

// 推送数据到源流，但不会立即发出
source$.next(1)
source$.next(2)
source$.next(3)

// 只有触发器激活时才发出缓冲的数据
trigger$.next('trigger') // 输出: 缓冲的数据: [1, 2, 3]

// 继续推送数据
source$.next(4)
source$.next(5)

// 再次触发输出
trigger$.next('trigger') // 输出: 缓冲的数据: [4, 5]
```

### 场景 2：空缓冲区处理

```typescript
import { $, buffer } from 'fluth'

const source$ = $()
const trigger$ = $()

const buffered$ = source$.pipe(buffer(trigger$))

buffered$.then((values) => {
  console.log('缓冲的数据:', values)
})

// 在没有数据时触发
trigger$.next('trigger') // 输出: 缓冲的数据: []
```

### 场景 3：批量数据处理

```typescript
import { $, buffer } from 'fluth'

const dataStream$ = $()
const batchTrigger$ = $()

const batchedData$ = dataStream$.pipe(buffer(batchTrigger$))

batchedData$.then((batch) => {
  console.log(`处理 ${batch.length} 条数据:`, batch)
  // 批量处理数据
})

// 快速产生数据
for (let i = 1; i <= 100; i++) {
  dataStream$.next(i)
}

// 批量处理
batchTrigger$.next('process') // 输出: 处理 100 条数据: [1, 2, 3, ..., 100]
```

### 场景 4：异步值的等待处理

```typescript
import { $, buffer } from 'fluth'

const source$ = $()
const trigger$ = $()

// shouldAwait 为 true（默认）
const buffered$ = source$.pipe(buffer(trigger$, true))

buffered$.then((values) => {
  console.log('缓冲的数据:', values)
})

// 发送立即值和异步值
source$.next(1)
source$.next(2)

const slowPromise = new Promise((resolve) => {
  setTimeout(() => resolve('异步结果'), 1000)
})
source$.next(slowPromise)

// 立即触发，但会等待异步值解析
trigger$.next('trigger')
// 1秒后输出: 缓冲的数据: [1, 2, '异步结果']
```

### 场景 5：不等待异步值

```typescript
import { $, buffer } from 'fluth'

const source$ = $()
const trigger$ = $()

// shouldAwait 为 false
const buffered$ = source$.pipe(buffer(trigger$, false))

buffered$.then((values) => {
  console.log('缓冲的数据:', values)
})

source$.next(1)
source$.next(2)

const slowPromise = new Promise((resolve) => {
  setTimeout(() => resolve('异步结果'), 1000)
})
source$.next(slowPromise)

// 立即触发，不等待异步值解析
trigger$.next('trigger') // 输出: 缓冲的数据: [1, 2, Promise] 或 [1, 2]
```

## 注意事项

1. **拒绝值处理**：buffer 操作符会忽略被拒绝的 Promise，不会将其添加到缓冲区
2. **触发时机**：只有触发器流发出值时才会发出缓冲的数据
3. **缓冲清空**：每次发出数据后会自动清空缓冲区
4. **空缓冲区**：如果没有数据时触发，会发出空数组
5. **完成处理**：当触发器流完成时，buffer 操作符也会完成

## 与其他操作符的关系

- 与 `audit` 的区别：`buffer` 收集所有值到数组，`audit` 只发出最新值
- 与 `combine` 的区别：`buffer` 收集单个流的历史值，`combine` 合并多个流的最新值
- 与 `throttle` 的区别：`buffer` 基于外部触发器，`throttle` 基于时间间隔
