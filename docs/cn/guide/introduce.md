# 简介

## 基础

`fluth`是一个类`promise`的流式编程库，擅长响应式编程。

假如认为`promise`是发布者而`then`方法是订阅者，`promise`的发布行为则只有一次。

`fluth`加强了`promise`，让`promise`可以不断的发布！

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

- 相比其他流式编程库，`fluth`更加简单易用，上手成本低，
- 相比`promise`，`fluth`可以不断发布并且支持取消定订阅
- 相比`promise`，`fluth`同步执行`then`方法，及时更新数据
- 相比`promise`，`fluth`保留每个订阅节点的数据供后续使用
- 相比`promise`，`fluth`完全支持 `PromiseLike`

## 对比 rxjs

[`rxjs`](https://rxjs.dev/)是当前主流的流式编程库，和`fluth`相比而言有几个区别：

1. `fluth`上手非常简单，是类`promise`的流式编程库，只要会使用`promise`就可以使用
2. `fluth`的观察者既可以串联也可以并联，而`rxjs`的`observer`之间是并联的
3. `fluth`保留了每个订阅节点的数据以及状态供后续消费
4. `fluth`可以添加插件来扩展流的功能和添加自定义行为

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
