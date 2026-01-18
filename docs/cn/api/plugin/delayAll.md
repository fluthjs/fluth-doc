# delayAll

延迟执行插件，在流链的所有节点上延迟指定时间后再将处理结果推送给子节点，只能在 `Stream` 节点上使用。

## 类型定义

```typescript
delayAll: (delayTime: number) => {
  executeAll: ({
    result,
    status,
    onfulfilled,
    onrejected,
    root,
  }: {
    result: PromiseLike<any> | any
    status: PromiseStatus | null
    onfulfilled?: OnFulfilled
    onrejected?: OnRejected
    root: boolean
  }) => Promise<unknown> | any
}
```

## 参数说明

- `delayTime` (必需): 延迟时间，单位为毫秒

## 详情

- 在流链的所有节点上执行，而不仅仅是单个节点
- 只在以下情况延迟：
  - 根节点（`root=true`）
  - 有成功处理函数（`onfulfilled`）的节点
  - 有错误处理函数（`onrejected`）且状态为 `REJECTED` 的节点
- 将结果包装成 `Promise`，在指定时间后 `resolve`
- 对于 `Promise` 类型的结果，会等待 `Promise` 解析后再开始延迟计时
- 串行延迟：每个节点的延迟是累加的

## 示例

### 场景 1：基础延迟

```typescript
import { $, delayAll } from 'fluth'

const stream$ = $().use(delayAll(100))

stream$.then((value) => {
  console.log(value)
})

stream$.next(1)
// 等待 100ms 后输出: 1
```

### 场景 2：流链串行延迟

```typescript
import { $, delayAll, consoleNode } from 'fluth'

// 链式结构: root(1) -> then(+1=2) -> then(+1=3) -> consoleNode
// 每个节点都会延迟：节点解析 -> 延迟 -> 下一个节点
const promise$ = $().use(delayAll(100))

promise$
  .then((value) => value + 1)
  .then((value) => value + 1)
  .use(consoleNode())

promise$.next(1)

// 0ms: 还没有任何输出
// 100ms: 根节点解析值 1，传递给第一个 then
// 200ms: 第一个 then 解析值 2，传递给第二个 then
// 300ms: 第二个 then 解析值 3，consoleNode 输出
// 输出: resolve 3
```

### 场景 3：每个节点都有 consoleNode

```typescript
import { $, delayAll, consoleNode } from 'fluth'

const promise$ = $().use(delayAll(100), consoleNode())

promise$
  .then((value) => value + 1)
  .use(consoleNode())
  .then((value) => value + 1)
  .use(consoleNode())

promise$.next(1)

// 100ms 后输出: resolve 1
// 200ms 后输出: resolve 2
// 300ms 后输出: resolve 3
```

### 场景 4：处理 Promise 值

```typescript
import { $, delayAll } from 'fluth'

const stream$ = $().use(delayAll(100))

stream$.then((value) => {
  console.log(value)
})

stream$.next(Promise.resolve(42))
// 等待 100ms 后输出: 42
```

### 场景 5：多次 next 调用

```typescript
import { $, delayAll } from 'fluth'

const stream$ = $().use(delayAll(100))
const results: number[] = []

stream$.then((value) => {
  results.push(value)
})

stream$.next(1)
stream$.next(2)
stream$.next(3)

// 100ms 后，由于 observable 行为，只有最后一个值被处理
// results: [3]
```

## 与 delayNode 的区别

- `delayNode` 只在当前节点延迟，不影响子节点
- `delayAll` 会在流链的所有节点上延迟

```typescript
import { $, delayNode, delayAll, consoleNode } from 'fluth'

// 使用 delayNode：只在根节点延迟
const stream1$ = $().use(delayNode(100), consoleNode())
stream1$.then((v) => v + 1).use(consoleNode())
stream1$.next(1)
// 100ms 后输出: resolve 1
// 立即输出: resolve 2

// 使用 delayAll：所有节点都延迟
const stream2$ = $().use(delayAll(100), consoleNode())
stream2$.then((v) => v + 1).use(consoleNode())
stream2$.next(1)
// 100ms 后输出: resolve 1
// 200ms 后输出: resolve 2
```

### 场景 6：计算总延迟时间

```typescript
import { $, delayAll } from 'fluth'

// 链式结构: root(1) -> then(+1=2) -> then(+1=3) -> then(设置结果)
// delayAll 串行延迟每个节点: 50ms * 3 个节点 = 150ms 总计
const promise$ = $().use(delayAll(50))

let result: number | undefined

promise$
  .then((value) => value + 1)
  .then((value) => value + 1)
  .then((value) => {
    result = value
  })

promise$.next(1)

// 0ms: result = undefined
// 50ms: 根节点解析值 1，result = undefined
// 100ms: 第一个 then 解析值 2，result = undefined
// 150ms: 第二个 then 解析值 3，result = 3
```
