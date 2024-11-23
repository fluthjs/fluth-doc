## 统一取消订阅

以`vue`框架为例，如果流是从其他地方导入到`vue`组件的，想要组件销毁后订阅自动取消，可以使用[ plugin ](/cn/api/stream#plugin)的`thenPlugin`统一处理：

```javascript
import { getCurrentScope, onScopeDispose } from "vue";
import { Stream } from "fluth";

const promise$ = new Stream();

promise$.plugin.then.push((unsubscribe) => {
  if (getCurrentScope()) onScopeDispose(unsubscribe);
});
```

在`vue`单文件`setup`函数中订阅的节点在`vue`组件销毁后自动取消订阅，避免内存泄漏。

## 统一错误处理

通过`plugin`的`executePlugin`统一对接点的错误进行处理:

```javascript
import { Stream } from "fluth";

const promise$ = new Stream();

promise$.plugin.execute.push((promise) =>
  promise.catch((err) => {
    console.error(err);
  })
);
```

## 分流

分流指的是在一条流中触发另一条流节点的运行

### 触发 Stream 流

![image](/branching-stream.drawio.png)

触发[ Stream ](/cn/api/stream#stream)节点则可以推送数据

```typescript
import { Stream } from "fluth";

const promise1$ = new Stream();
const subjection1$ = promise1$.then((data) => console.log(data));

const promise2$ = new Stream();
// 在一条流中触发另一条流
const subjection2$ = promise2$.then((data) => {
  promise1$.next(data + 1);
});
```

### 触发 Subjection 流

![image](/branching-subjection.drawio.png)
触发[ Subjection ](/cn/api/stream#subjection)节点则无法推送数据

```typescript
import { Stream } from "fluth";

const promise1$ = new Stream();
const subjection1$ = promise1$.then((data) => console.log(data));

const promise2$ = new Stream();
// 在一条流中触发另一条流
const subjection2$ = promise2$.then((data) => {
  subjection1$.execute();
});
```

## 合流

如果需要合并多条流的数据，需要看看操作符[ combine ](/cn/api/operator/combine)、[ merge ](/cn/api/operator/merge)、[ concat ](/cn/api/operator/concat)等来进行合流。
