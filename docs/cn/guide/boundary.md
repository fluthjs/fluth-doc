# 边界说明

fluth 从底层实现了类似 Promise 的使用体验，但是 promise 是推送数据一次性的而 fluth 的流是可以多次推送数据，所以 fluth 的边界场景远比 promise 复杂，下面是一些边界场景的说明：

## 同步和异步

fluth 的流是同步的，而 promise 是异步的

```typescript
import { $ } from 'fluth'
const promise$ = $()

promise$.then((value) => {
  console.log(value)
})

promise$.next(1)
promise$.next(2)
promise$.next(3)
console.log('start')

// 输出
// 1
// 2
// 3
// start
```

```typescript
Promise.resolve(1).then((value) => {
  console.log(value)
})

console.log('start')

// 输出
// start
// 1
```

仅当 fluth 推送异步数据时，流才会变成异步的

```typescript
import { $ } from 'fluth'
const promise$ = $()

promise$.then((value) => {
  console.log(value)
})

promise$.next(Promise.resolve(1))
console.log('start')

// 输出
// start
// 1
```

::: tip 提示
如果同步连续调用多次 `promise$.next(Promise.resolve(...))`，由于 fluth 默认采用覆盖式竞态机制，前几次尚未 resolve 的异步推送会被最后一次覆盖并静默丢弃，详见下方[竞态异步](#竞态异步)。
:::

这样设计的原因是：当前 fluth 的主要使用场景是前端逻辑的响应式编程，如果数据处理的每个节点都是异步的，会触发页面频繁的渲染。

## 竞态异步

因为 fluth 可以链式地进行订阅，而订阅节点可能是异步节点，异步节点返回的时间是不确定的。

当异步节点还没有执行完成时，如果上游流推送了新的数据，旧的未完成异步结果既不会被设置为节点的值，也不会传递给下游节点，而是以新数据重新执行异步流程。

如图所示，当流推送了新的数据时，原来异步节点返回的数据会直接丢弃，而采用新的数据重新继续异步操作：

<div style="display: flex; justify-content: center">
  <img src="/raceCase.drawio.svg" alt="image" >
</div>

### 底层机制：`_rootPromise` 覆盖式竞态语义

fluth 在根流（`Stream`）内部维护了一个 `_rootPromise` 引用，用于标识当前最新一次推送：

1. **每次 `next()` 刷新根级标识**：调用 `stream$.next(payload)`（或内部调用 `next()` 的 `stream$.set()`）时，fluth 会将本次推送归一化为一个 Promise（若 `payload` 本身是 `PromiseLike` 则直接使用，否则用 `Promise.resolve(payload)` 包装），并覆盖更新根流的 `_rootPromise`（若重复传入同一个 Promise 实例引用则会被忽略）。
2. **整条链路校验最新标识**：数据沿下游 `Observable` 节点传播时，每个节点都会携带触发本次传播的 `rootPromise`。在节点开始执行前，以及任意异步回调返回的 Promise 进入 `fulfilled` / `rejected` 状态准备写值并继续向下游传播时，fluth 都会校验 `rootPromise === this._root?._rootPromise`。
3. **旧的未完成异步回调被静默丢弃**：一旦上游在旧异步任务完成前发出了新值，`_rootPromise` 已被刷新，旧异步回调无论最终 resolve 还是 reject，都会被**静默丢弃**——既不会更新该节点的 `value` 和 `status`，也不会触发 `afterSetValue` 回调，更不会继续流向下游的 `then` / `catch` 节点。

这种行为等价于响应式编程中类似 RxJS `switchMap` 的**覆盖式竞态语义（最后一次推送生效）**：

```typescript
import { $ } from 'fluth'

const search$ = $<string>()

search$
  .then((keyword) => {
    const delay = keyword === 'a' ? 300 : 100
    return new Promise<string>((resolve) => {
      setTimeout(() => resolve(`result:${keyword}`), delay)
    })
  })
  .then((result) => {
    console.log('渲染结果:', result)
  })

search$.next('a') // 刷新 _rootPromise（耗时 300ms）
search$.next('ab') // 再次刷新 _rootPromise（耗时 100ms），'a' 的回调结果将被静默丢弃

// 100ms 后输出: 渲染结果: result:ab
// 300ms 后 'a' resolve，但因 _rootPromise 已变更，被静默丢弃，不会再输出
```

同样，如果连续同步推送多个 `Promise` 且不等待其完成：

```typescript
import { $ } from 'fluth'

const stream$ = $<number>()
stream$.then((value) => console.log(value))

stream$.next(Promise.resolve(1))
stream$.next(Promise.resolve(2))
stream$.next(Promise.resolve(3))

// 仅输出: 3（1 和 2 在微任务执行时因 _rootPromise 已被覆盖而被静默丢弃）
```

::: warning 注意：fluth 不会自动取消底层请求
`_rootPromise` 机制只在 fluth 数据传播层静默丢弃过期结果，并不会自动中止已经发出的 `fetch` 等底层异步请求。如果需要节省网络带宽或避免过期写请求到达服务端，请配合 `AbortController` 主动取消前一次请求。
:::

### 适用场景

覆盖式竞态丢弃非常适合**查询类、渲染类、交互编排类**等「只关心最新一次输入对应结果」的前端响应式场景：

- **搜索框防抖请求**：用户连续输入关键词时，搭配 `debounce` 发起搜索请求；即便前一次请求网络较慢、后返回，也会被自动丢弃，不会出现旧结果覆盖新结果的界面错乱。
- **表单联动与级联查询**：切换筛选条件、省市区或 Tab 页签时触发异步拉取下拉选项或列表数据，始终只渲染最后一次切换对应的数据。
- **异步表单校验**：输入过程中实时远程校验（如检查用户名是否已存在），只需保留最后一次输入对应的校验结果，无需手写请求序号（requestId）或竞态守卫逻辑。

### 不适用场景与注意事项

::: danger 高风险提醒：以下场景切勿依赖默认异步丢弃语义
只要业务要求**不能丢失任何一条消息**或**每一次异步操作都必须完整执行到下游**，就不应直接在 fluth 的异步链路中返回 Promise。
:::

典型不适用场景包括：

- **WebSocket / SSE 连续推送消息**：短时间内连续到达多条消息，若下游 `then` 中包含异步操作（如异步解析、写 IndexedDB、请求补全接口），新消息的 `next()` 会刷新 `_rootPromise`，导致前一条未完成消息的异步处理被静默丢弃。
- **队列写操作与有序提交**：如连续点击触发的串行写库、表单多步依次提交、离线队列逐条同步等，后一次触发会丢弃前一次尚未完成的写操作下游逻辑。
- **埋点上报与日志收集**：高频交互事件触发异步上报时，如果直接把上报 Promise 返回给下游链路，后续事件会覆盖并丢弃未完成的上报状态回调。

#### 建议处理方式

如果需要在上述场景中使用 fluth，可以采用以下方式规避竞态丢弃：

1. **同步消费，不向流返回 Promise**：对于独立的异步副作用（如埋点上报），在 `then` 回调中直接触发异步调用并自行处理异常，而**不要 `return` Promise**。这样节点同步完成，不会进入异步竞态窗口。

```typescript
track$.then((event) => {
  // 不 return Promise，脱离流的 _rootPromise 竞态丢弃控制
  void sendAnalytics(event).catch((err) => console.error('上报失败:', err))
})
```

2. **使用显式串行队列承接消息**：对于 WebSocket 消息或必须按序执行的写操作，在同步 `then` 中将任务追加到外部串行队列中逐条消费：

```typescript
let queue = Promise.resolve()

wsMessage$.then((msg) => {
  queue = queue
    .then(() => persistMessage(msg))
    .catch((err) => console.error('消息处理失败:', err))
})
```

3. **结合 `buffer` 批量聚合后再处理**：对于高频事件或埋点，可先用 [`buffer`](/cn/api/operator/buffer) 操作符同步收集一批数据，再按批次统一上报。
4. **选择更契合的并发原语**：如果业务核心是严格不丢消息的事件总线，或需要 `concatMap`（顺序排队）、`mergeMap`（并发保留全部）、`exhaustMap`（忽略期间新输入）等多种并发策略，建议使用专用任务队列或 RxJS 等工具。

## 错误处理

如果节点执行过程中抛出了错误，这个错误会传递给后面定义了 onRejected 处理的订阅节点进行处理，和 promise 的错误处理方式一致。

fluth 对于中间没有定义 onRejected 处理的订阅节点，会直接跳过但是会将订阅节点的 status 状态设置为 `rejected`。

<div style="display: flex; justify-content: center">
  <img src="/errorCase.drawio.svg" alt="image" >
</div>

## 取消订阅

- 节点[取消订阅](/cn/guide/base.html#取消订阅)，当节点处于 pending 状态时，当节点执行完成后，不会触发下游节点的执行。
- 节点[取消订阅](/cn/guide/base.html#取消订阅)，其所有的子节点也会取消订阅，此时如果其子节点处于 pending 状态时,当子节点执行完成后。
  - 不会触发子节点下游节点的执行
  - 当所有子节点 pending 状态都结束时，会清理父节点防止内存泄漏。
