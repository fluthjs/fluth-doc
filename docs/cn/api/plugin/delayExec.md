# delayExec

延迟执行插件，在当前节点延迟指定时间后再将处理结果推送给子节点。

## 类型定义

```typescript
delayExec: (delayTime: number) => {
  execute: ({ result }: { result: Promise<any> | any }) => Promise<unknown>
}
```

## 参数说明

- `delayTime` (必需): 延迟时间，单位为毫秒

## 返回值

返回一个 ExecutePlugin 插件，会将当前节点的执行结果延迟指定时间后推送。

## 核心行为

- **execute 插件**: 只在当前节点执行，不会传播到子节点
- **延迟执行**: 将结果包装成 Promise，在指定时间后 resolve
- **Promise 处理**: 对于 Promise 类型的结果，会等待 Promise 解析后再开始延迟计时
- **时间控制**: 精确控制数据流的时间节奏

## 使用场景

### 场景 1：基础延迟

```typescript
import { $ } from 'fluth'

const stream$ = $().use(delayExec(100))

stream$.then((value) => {
  console.log(value)
})

stream$.next(1)
// 等待 100ms 后输出: 1
```

### 场景 2：与其他插件结合

```typescript
import { $, consoleNode } from 'fluth'

const promise$ = $().use(delayExec(100), consoleNode())

promise$
  .then((value) => value + 1)
  .use(delayExec(100), consoleNode())
  .then((value) => value + 1)
  .use(delayExec(100), consoleNode())

promise$.next(1)
// 等待 100ms 后输出: resolve 1
// 等待 200ms 后输出: resolve 2
// 等待 300ms 后输出: resolve 3
```

### 场景 3：流水线延迟处理

```typescript
import { $ } from 'fluth'

const processingStream$ = $()

// 第一步：数据预处理（延迟 200ms）
const preprocessed$ = processingStream$.use(delayExec(200)).then((data) => {
  console.log('预处理完成:', data)
  return { ...data, preprocessed: true }
})

// 第二步：数据验证（延迟 300ms）
const validated$ = preprocessed$.use(delayExec(300)).then((data) => {
  console.log('验证完成:', data)
  return { ...data, validated: true }
})

// 第三步：数据存储（延迟 150ms）
const stored$ = validated$.use(delayExec(150)).then((data) => {
  console.log('存储完成:', data)
  return { ...data, stored: true }
})

processingStream$.next({ id: 1, content: 'test data' })
// 200ms 后输出: 预处理完成: { id: 1, content: 'test data', preprocessed: true }
// 300ms 后输出: 验证完成: { id: 1, content: 'test data', preprocessed: true, validated: true }
// 150ms 后输出: 存储完成: { id: 1, content: 'test data', preprocessed: true, validated: true, stored: true }
```

### 场景 4：API 请求限流

```typescript
import { $ } from 'fluth'

const apiStream$ = $<string>()

// 限制 API 请求频率，避免触发限流
const rateLimitedAPI$ = apiStream$
  .use(delayExec(1000)) // 每个请求间隔 1 秒
  .then(async (url) => {
    console.log('发起请求:', url)
    const response = await fetch(url)
    return response.json()
  })

rateLimitedAPI$.then((data) => {
  console.log('请求完成:', data)
})

// 快速发送多个请求
apiStream$.next('https://api.example.com/users')
apiStream$.next('https://api.example.com/posts')
apiStream$.next('https://api.example.com/comments')

// 输出：
// 1秒后: 发起请求: https://api.example.com/users
// 1秒后: 发起请求: https://api.example.com/posts
// 1秒后: 发起请求: https://api.example.com/comments
```

## 注意事项

1. **返回值**: 插件总是返回 Promise，即使输入是同步值
2. **Promise 处理**: 对于 Promise 类型的结果，会等待 Promise 解析后再开始延迟计时
3. **时间精度**: 延迟时间基于 `setTimeout`，实际延迟可能略有偏差
4. **内存管理**: 长时间的延迟可能会占用内存，注意及时清理
5. **错误处理**: 如果输入的 Promise 被拒绝，延迟插件会直接传递错误

## 与其他插件的关系

- **vs debounce/throttle**: `delayExec` 是固定延迟，`debounce/throttle` 是基于事件频率的延迟
- **执行顺序**: 可以与其他插件组合使用，按照链式顺序执行
- **适用场景**: `delayExec` 适合需要精确控制时间间隔的场景
