# delayNode

延迟执行插件，在当前节点延迟指定时间后再将处理结果推送给子节点。

## 类型定义

```typescript
delayNode: (delayTime: number) => {
  execute: ({ result }: { result: PromiseLike<any> | any }) => Promise<unknown>
}
```

## 参数说明

- `delayTime` (必需): 延迟时间，单位为毫秒

## 详情

- 只在当前节点执行，不会传播到子节点
- 将结果包装成 `Promise`，在指定时间后 `resolve`
- 对于 `Promise` 类型的结果，会等待 `Promise` 解析后再开始延迟计时
- 精确控制数据流的时间节奏

## 示例

### 场景 1：基础延迟

```typescript
import { $, delayNode } from 'fluth'

const stream$ = $().use(delayNode(100))

stream$.then((value) => {
  console.log(value)
})

stream$.next(1)
// 等待 100ms 后输出: 1
```

### 场景 2：与其他插件结合

```typescript
import { $, delayNode, consoleNode } from 'fluth'

const promise$ = $().use(delayNode(100), consoleNode())

promise$
  .then((value) => value + 1)
  .use(delayNode(100), consoleNode())
  .then((value) => value + 1)
  .use(delayNode(100), consoleNode())

promise$.next(1)
// 等待 100ms 后输出: resolve 1
// 等待 200ms 后输出: resolve 2
// 等待 300ms 后输出: resolve 3
```

### 场景 3：流水线延迟处理

```typescript
import { $, delayNode } from 'fluth'

const processingStream$ = $()

// 第一步：数据预处理（延迟 200ms）
const preprocessed$ = processingStream$.use(delayNode(200)).then((data) => {
  console.log('预处理完成:', data)
  return { ...data, preprocessed: true }
})

// 第二步：数据验证（延迟 300ms）
const validated$ = preprocessed$.use(delayNode(300)).then((data) => {
  console.log('验证完成:', data)
  return { ...data, validated: true }
})

// 第三步：数据存储（延迟 150ms）
const stored$ = validated$.use(delayNode(150)).then((data) => {
  console.log('存储完成:', data)
  return { ...data, stored: true }
})

processingStream$.next({ id: 1, content: 'test data' })
// 200ms 后输出: 预处理完成: { id: 1, content: 'test data', preprocessed: true }
// 300ms 后输出: 验证完成: { id: 1, content: 'test data', preprocessed: true, validated: true }
// 150ms 后输出: 存储完成: { id: 1, content: 'test data', preprocessed: true, validated: true, stored: true }
```

### 场景 4：移除插件

```typescript
import { $, delayNode } from 'fluth'

const plugin = delayNode(100)
const stream$ = $().use(plugin)

stream$.then((value) => {
  console.log(value)
})

stream$.next(1)
// 100ms 后输出: 1

stream$.remove(plugin)
stream$.next(2)
// 立即输出: 2（无延迟）
```

## 与 delayAll 的区别

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
