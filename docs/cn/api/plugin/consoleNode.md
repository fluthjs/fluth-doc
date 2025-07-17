# consoleNode

调试插件，在当前节点输出执行结果，用于单个节点的调试和监控。

## 类型定义

```typescript
consoleNode: (resolvePrefix?: string, rejectPrefix?: string) => {
  execute: ({ result }: { result: Promise<any> | any }) => any
}
```

## 参数说明

- `resolvePrefix` (可选): 成功时的控制台前缀，默认为 `'resolve'`
- `rejectPrefix` (可选): 失败时的控制台前缀，默认为 `'reject'`

## 返回值

返回一个 execute 插件，只在当前节点执行输出操作，返回原始的 `result` 值。

## 核心行为

- **execute 插件**: 只在当前节点执行，不会传播到子节点
- **即时输出**: 无论是否有处理函数，都会立即输出结果
- **Promise 处理**: 对于 Promise 类型的结果，会等待 Promise 解析后再输出
- **返回原值**: 返回原始的 `result`，不会修改数据流

## 使用场景

### 场景 1：基础调试输出

```typescript
import { $ } from 'fluth'

const stream$ = $().use(consoleNode())

stream$.next(1)
// 输出: resolve 1

const promise = Promise.resolve(2)
stream$.next(promise)
// 输出: resolve 2

stream$.next(3)
stream$.next(4)
// 输出: resolve 3
// 输出: resolve 4
```

### 场景 2：自定义前缀

```typescript
import { $ } from 'fluth'

const stream$ = $().use(consoleNode('custom'))

stream$.next('test')
// 输出: custom test

const promise = Promise.resolve('async-test')
stream$.next(promise)
// 输出: custom async-test
```

### 场景 3：自定义成功和失败前缀

```typescript
import { $ } from 'fluth'

const stream$ = $().use(consoleNode('success', 'failure'))

// 测试成功情况
stream$.next('test-value')
// 输出: success test-value

// 测试失败情况
const rejectedPromise = Promise.reject(new Error('custom error'))
stream$.next(rejectedPromise)
// 输出: failure Error: custom error
```

### 场景 4：与防抖操作符结合

```typescript
import { $, debounce } from 'fluth'

const promise$ = $()
  .pipe(debounce(100))
  .use(consoleNode())
  .then((value) => console.log(value))

promise$.next(1)
promise$.next(2)
promise$.next(3)
promise$.next(4)
promise$.next(5)

// 立即输出（每次 next 都会触发 consoleNode）:
// resolve 1
// resolve 2
// resolve 3
// resolve 4
// resolve 5

// 等待 100ms 后输出（防抖后的结果）:
// resolve 5
// 5
```

### 场景 5：插件移除

```typescript
import { $ } from 'fluth'

const plugin = consoleNode()
const stream$ = $().use(plugin)

stream$.next(1)
// 输出: resolve 1

stream$.remove(plugin)
stream$.next(2)
// 不再输出
```

## 注意事项

1. **返回值**: 插件会返回原始的 `result`，不会修改数据流
2. **Promise 处理**: 对于 Promise 类型的结果，会等待 Promise 解析后再输出
3. **错误处理**: 对于被拒绝的 Promise，会使用 `rejectPrefix` 输出错误信息
4. **移除插件**: 可以通过 `remove` 方法移除插件，停止输出
5. **即时输出**: 每次调用都会立即输出，不受防抖等操作符影响

## 与其他插件的关系

- **vs consoleAll**: `consoleNode` 是 execute 插件，只在单个节点执行；`consoleAll` 是 executeAll 插件，在所有节点执行
- **vs debugNode**: 功能相似，但 `consoleNode` 输出到控制台，`debugNode` 触发调试器断点
- **适用场景**: `consoleNode` 适合调试特定节点的数据输出，不需要全链路监控时使用

## 实际应用示例

### 数据流调试

```typescript
import { $, debounce } from 'fluth'

const dataStream$ = $<number>()

// 在处理链的不同阶段添加调试
const processed$ = dataStream$
  .use(consoleNode('原始数据'))
  .then((value) => value * 2)
  .use(consoleNode('乘法结果'))
  .pipe(debounce(100))
  .use(consoleNode('防抖结果'))
  .then((value) => value + 10)
  .use(consoleNode('最终结果'))

dataStream$.next(5)
dataStream$.next(10)
dataStream$.next(15)

// 输出:
// 原始数据 5
// 乘法结果 10
// 原始数据 10
// 乘法结果 20
// 原始数据 15
// 乘法结果 30
// 防抖结果 30
// 最终结果 40
```
