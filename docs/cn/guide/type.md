# typescript 类型支持

## 初始值类型自动推导

在使用`$`创建流时，`fluth`会自动推导初始值的类型。

```typescript
import { $ } from "fluth";
const promise$ = $({ a: "1", b: 2 });
promise$.value; // {a: string, b: number}

const promise$ = $<{ a: string; b: number }>();
promise$.value; // {a: string, b: number} | undefined
```

## 订阅节点类型自动推导

在使用`then`订阅流时，`fluth`会自动推导订阅节点的类型。

```typescript
import { $ } from "fluth";
const promise$ = $({ a: "1", b: 2 });
const observable$ = promise$.then((data) => ({ c: state.a, d: state.b }));
observable$.value; // {c: string, d: number}
```

## 插件类型自动推导

在使用插件时，`fluth`会自动推导插件的类型。

```typescript
import { $, throttle } from "fluth";

const promise$ = $().use(throttle);

// 能够自动推导是否存在 throttle 方法
const observable$ = promise$.throttle(1000).then().throttle(1000);
```
