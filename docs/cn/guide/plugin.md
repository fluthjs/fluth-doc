# 使用插件

## 插件类型

`fluth`支持三种类型插件：`then`、`execute`、`chain`

### then 插件

在`then`操作时触发，一般用于取消订阅节点

```typescript
import { $ } from "fluth";

// 自定义then插件, 1s后取消节点订阅
const thenPlugin = {
  then: (unsubscribe) => {
    setTimeout(unsubscribe, 1000);
  },
};

const promise$ = $(1).use(thenPlugin);

promise$.then((data) => {
  console.log(data);
});

promise$.next(2); // 打印2
sleep(1000);
promise$.next(3); // 不打印3
```

### execute 插件

在订阅节点`execute`时修改处理结果

```typescript
import { $ } from "fluth";

// 自定义execute插件, 执行节点时修改结果
const executePlugin = {
  execute: ({ result }) => {
    return result + 1;
  },
};

const promise$ = $().use(executePlugin);

promise$.then((data) => console.log(data));

promise$.next(1); // 打印2
```

### chain 插件

为流上所有的订阅节点添加链式方法

```typescript
import { Observable, $ } from "fluth";

// 自定义chain插件, 为流添加链式方法
const chainPlugin = {
  chain: (observer: Observable) => ({
    // 添加链式自定义方法，可链式调用
    customMethod: () => "current: " + observer.value,
  }),
};

const promise$ = $(1).use(chainPlugin);
const observable$ = promise$.then((data) => data + 1);
promise$.next(2);

console.log(promise$.customMethod()); // 打印 current 2
console.log(observable$.customMethod()); // 打印 current 3
```

## 创建带默认插件的流

流在使用插件前都需要采用`use`方法添加插件，为了避免每次都添加插件，`fluth`提供了创建带默认插件的流的方法`createStream`

```typescript
import { createStream, delay, throttle, debounce } from "fluth";

// 创建带默认插件的流
const new$ = createStream(delay, throttle, debounce);
// 使用流
const promise$ = new$(1);
```
