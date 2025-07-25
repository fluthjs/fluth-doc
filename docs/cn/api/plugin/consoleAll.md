# consoleAll

调试插件，在流链的所有节点上输出执行结果，用于调试和监控数据流，只能在`Stream`节点上使用。

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

## 详情

- 在流链的所有节点上执行，而不仅仅是单个节点
- 只在以下情况输出：
  - 根节点（`root=true`）
  - 有成功处理函数（`onfulfilled`）的节点
  - 有错误处理函数（`onrejected`）且状态为 `REJECTED` 的节点
- 对于 `Promise` 类型的结果，会等待 `Promise` 解析后再输出
- 返回原始的 `result`，不会修改数据流

## 示例

### 场景 1：基础调试输出

```typescript
import { $ } from 'fluth'

const stream$ = $().use(consoleAll())

stream$.next(1)
// 输出: resolve 1

const promise = Promise.resolve(2)
stream$.next(promise)
// 输出: resolve 2
```

### 场景 2：流链调试输出

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

### 场景 3：自定义前缀调试输出

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

### 场景 4：与操作符结合调试输出

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
