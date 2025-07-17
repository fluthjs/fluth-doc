# consoleAll

调试插件，在流链的所有节点上输出执行结果，用于调试和监控数据流。

## 类型定义

```typescript
consoleAll: (resolvePrefix?: string, rejectPrefix?: string) => {
  executeAll: ({
    result,
    status,
    onfulfilled,
    onrejected,
    root,
  }: {
    result: Promise<any> | any
    status: PromiseStatus | null
    onfulfilled?: OnFulfilled
    onrejected?: OnRejected
    root: boolean
  }) => any
}
```

## 参数说明

- `resolvePrefix` (可选): 成功时的控制台前缀，默认为 `'resolve'`
- `rejectPrefix` (可选): 失败时的控制台前缀，默认为 `'reject'`

## 返回值

返回一个 ExecuteAllPlugin 插件，会在流链的所有节点上执行输出操作。

## 核心行为

- **executeAll 插件**: 在流链的所有节点上执行，而不仅仅是单个节点
- **智能过滤**: 只在以下情况输出：
  - 根节点（`root=true`）
  - 有成功处理函数（`onfulfilled`）的节点
  - 有错误处理函数（`onrejected`）且状态为 REJECTED 的节点
- **Promise 处理**: 对于 Promise 类型的结果，会等待 Promise 解析后再输出
- **原始数据**: 返回原始的 `result`，不会修改数据流

## 使用场景

### 场景 1：基础使用

```typescript
import { $ } from 'fluth'

const stream$ = $().use(consoleAll())

stream$.next(1)
// 输出: resolve 1

const promise = Promise.resolve(2)
stream$.next(promise)
// 输出: resolve 2
```

### 场景 2：流链调试

```typescript
import { $ } from 'fluth'

const promise$ = $().use(consoleAll())

promise$.then((value) => value + 1).then((value) => value + 1)

promise$.next(1)
// 输出：
// resolve 1
// resolve 2
// resolve 3
```

### 场景 3：自定义前缀

```typescript
import { $ } from 'fluth'

// 自定义前缀
const promise$ = $().use(consoleAll('成功', '失败'))

promise$.then((value) => value + 1)

promise$.next(1)
// 输出：
// 成功 1
// 成功 2

const rejectedPromise = Promise.reject(new Error('错误'))
promise$.next(rejectedPromise)
// 输出：失败 Error: 错误
```

### 场景 4：与操作符结合使用

```typescript
import { $, debounce } from 'fluth'

const promise$ = $()
  .use(consoleAll())
  .pipe(debounce(100))
  .then((value) => value + 1)

promise$.next(1)
promise$.next(2)
promise$.next(3)
promise$.next(4)
promise$.next(5)
// 输出：
// resolve 1
// resolve 2
// resolve 3
// resolve 4
// resolve 5
// 等待 100ms 后输出：resolve 6
```

### 场景 5：移除插件

```typescript
import { $, consoleAll } from 'fluth'

const plugin = consoleAll()
const stream$ = $().use(plugin)

stream$.then((value) => value + 1)
stream$.next(1)
// 输出: resolve 1, resolve 2

stream$.remove(plugin)
stream$.next(2)
// 不再输出
```

## 注意事项

1. **返回值**: 插件会返回原始的 `result`，不会修改数据流
2. **Promise 处理**: 对于 Promise 类型的结果，会等待 Promise 解析后再输出
3. **错误处理**: 对于被拒绝的 Promise，会输出错误信息
4. **智能过滤**: 只在有意义的节点上输出，避免冗余信息
5. **移除插件**: 可以通过 `remove` 方法移除插件，停止输出
6. **与 consoleNode 的区别**: `consoleAll` 会在流链的所有节点上执行，而 `consoleNode` 只在单个节点上执行

## 与其他插件的关系

- **vs consoleNode**: `consoleAll` 是 executeAll 插件，在所有节点执行；`consoleNode` 是 execute 插件，只在单个节点执行
- **vs debugAll**: 功能相似，但 `consoleAll` 输出到控制台，`debugAll` 触发调试器断点
- **适用场景**: `consoleAll` 适合调试复杂的流链，了解数据在每个节点的流转情况

## 完整示例：数据处理管道调试

```typescript
import { $, debounce, throttle } from 'fluth'

interface DataItem {
  id: number
  value: string
  timestamp: number
}

const dataStream$ = $<DataItem>().use(consoleAll('数据', '错误'))

// 数据验证
const validated$ = dataStream$.then((item) => {
  if (!item.id || !item.value) {
    throw new Error(`无效数据: ${JSON.stringify(item)}`)
  }
  return { ...item, validated: true }
})

// 数据转换
const transformed$ = validated$.pipe(debounce(100)).then((item) => ({
  ...item,
  processed: true,
  processedAt: Date.now(),
}))

// 数据存储
const stored$ = transformed$.pipe(throttle(200)).then((item) => {
  // 模拟存储操作
  console.log('存储数据:', item)
  return { ...item, stored: true }
})

// 模拟数据输入
dataStream$.next({ id: 1, value: 'test1', timestamp: Date.now() })
dataStream$.next({ id: 2, value: 'test2', timestamp: Date.now() })
dataStream$.next({ id: 0, value: '', timestamp: Date.now() }) // 无效数据

// 输出会显示数据在每个节点的流转情况：
// 数据 { id: 1, value: 'test1', timestamp: ... }
// 数据 { id: 1, value: 'test1', timestamp: ..., validated: true }
// 数据 { id: 2, value: 'test2', timestamp: ... }
// 数据 { id: 2, value: 'test2', timestamp: ..., validated: true }
// 错误 Error: 无效数据: {"id":0,"value":"","timestamp":...}
// ... 经过防抖和节流后的输出
```
