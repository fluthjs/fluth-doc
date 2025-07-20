# debugAll

调试插件，在流链的所有节点上触发调试器断点，用于深度调试和流程跟踪，只能在`Stream`节点上使用。
:::warning 注意
浏览器可能会过滤`node_modules`中的`debugger`语句，导致调试器断点不生效。需要手动在浏览器开发者工具->setting->ignore list 中添加开启`node_modules`的调试
:::

## 类型定义

```typescript
debugAll: () => {
  executeAll: ({
    result,
    onfulfilled,
    onrejected,
    root,
  }: {
    result: Promise<any> | any
    onfulfilled?: OnFulfilled
    onrejected?: OnRejected
    root: boolean
  }) => any
}
```

## 返回值

返回一个 ExecuteAllPlugin 插件，会在流链的所有节点上触发调试器断点。

## 核心行为

- **executeAll 插件**: 在流链的所有节点上执行，而不仅仅是单个节点
- **调试器触发**: 在满足条件的节点上触发 `debugger` 语句
- **Promise 处理**: 对于 Promise 类型的结果，会等待 Promise 解析后再触发调试器
- **原始数据**: 返回原始的 `result`，不会修改数据流

## 使用场景

### 场景 1：基础使用

```typescript
import { $ } from 'fluth'

const promise$ = $().use(debugAll())

promise$.then((value) => value + 1).then((value) => value + 1)

promise$.next(1)
// 在浏览器开发者工具中会在每个节点触发调试器断点
```

### 场景 2：复杂流链调试

```typescript
import { $ } from 'fluth'

// 测试 executeAll 在流链中的传播
const rootStream = $()
rootStream.use(debugAll())

const step1 = rootStream.then((value) => {
  console.log('step1 处理:', value)
  return value * 2
})

const step2 = step1.then((value) => {
  console.log('step2 处理:', value)
  return value + 10
})

step2.then((value) => {
  console.log('最终结果:', value)
})

rootStream.next(5)
// 会在每个节点触发调试器断点：
// 1. rootStream 节点
// 2. step1 节点
// 3. step2 节点
// 4. 最终订阅节点
```

### 场景 3：Promise 错误调试

```typescript
import { $ } from 'fluth'

const promise$ = $().use(debugAll())

promise$.then((value) => value + 1)

const rejectedPromise = Promise.reject(new Error('test error'))
promise$.next(rejectedPromise)
// 会在错误处理时触发调试器断点
```

### 场景 4：流程跟踪

```typescript
import { $ } from 'fluth'

const stream$ = $().use(debugAll())

// 创建多个处理步骤
const validation$ = stream$.then((data) => {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid data')
  }
  return { ...data, validated: true }
})

const transformation$ = validation$.then((data) => {
  return {
    ...data,
    processed: true,
    timestamp: Date.now(),
  }
})

const storage$ = transformation$.then((data) => {
  console.log('Storing data:', data)
  return { ...data, stored: true }
})

stream$.next({ id: 1, name: 'test' })
// 调试器会在每个步骤暂停，允许检查数据流转
```
