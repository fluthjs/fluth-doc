# 简介

## 什么是 fluth？

fluth(/fluːθ/) 由 **flu**x + **th**en 两个单词组合而来，代表类似 promise 的流。

fluth 是一个类 promise 的流式编程库，擅长响应式编程。假如认为 promise 是发布者而 then 方法是订阅者，promise 的发布行为则只有一次。

fluth 加强了 promise，让 promise 可以不断的发布！如果你熟悉 Promise，那么你已经掌握了 fluth 的基础。

```typescript
import { $ } from 'fluth'

const promise$ = $()

promise$.then(
  (r) => console.log('resolve', r),
  (e) => console.log('reject', e)
)

promise$.next(1)
promise$.next(Promise.reject(2))
promise$.next(3)

// Logs:
// resolve 2
// resolve 4
// reject 3
```

```typescript
import { $ } from 'fluth'

const promise$ = $(0)
const observable$ = promise$.thenImmediate(v => v + 1)

promise$.value === 0 ✅
observable$.value === 1 ✅

promise$.next(1)

promise$.value === 1 ✅
observable$.value === 2 ✅
```

- 相比其他流式编程库，fluth 更加简单易用，上手成本低，
- 相比 promise，fluth 可以不断发布并且支持取消定订阅
- 相比 promise，fluth 同步执行 then 方法，及时更新数据
- 相比 promise，fluth 保留每个订阅节点的数据供后续使用
- 相比 promise，fluth 完全支持 `PromiseLike`

## 对比 rxjs

[rxjs](https://rxjs.dev/)是当前主流的流式编程库，和 fluth 相比而言有几个区别：

1. fluth 上手非常简单，是类 promise 的流式编程库，只要会使用 promise 就可以使用
2. fluth 的流是 hot、multicast 的，而 rxjs 的流还具备 cold、unicast 的特性
3. fluth 可以流链式订阅，而 rxjs 的订阅后无法再链式订阅
4. fluth 保留了每个订阅节点的数据以及状态供后续消费
5. fluth 订阅节点存在和 promise 类似的 status 状态
6. fluth 可以添加插件来扩展流的功能和添加自定义行为

```javascript
// rxjs:
stream$.pipe(operator1, operator2, operator3)
stream$.subscribe(observer1)
stream$.subscribe(observer2)
stream$.subscribe(observer3)
```

<!-- prettier-ignore-start -->
```javascript
//fluth:
stream$.use(plugin1, plugin2, plugin3)

stream$
  .pipe(operator1, operator2)
  .then(observer1)
  .pipe(operator3)
  .then(observer2)
  .pipe(operator4)
  .then(observer3);

stream$.next(1);

```
<!-- prettier-ignore-end -->
