# 不可变数据

`fluth`支持不可变数据，底层采用[`limu`](https://tnfe.github.io/limu/)实现。

## Stream

`Stream`对象的`set`方法可以`immutable`的修改节点的数据。

```typescript
import { $ } from "fluth";
const promise$ = $({ a: 1, b: { c: 2 } });
const oldValue = promise$.value;

promise$.set((state) => (state.a = 3));
const newValue = promise$.value;

console.log(oldValue === newValue); // false
console.log(oldValue.b === newValue.b); // true
```

## Observable

`Observable`对象的`$then`、`$thenOnce`、`$thenImmediate`方法也可以`immutable`的修改流经当前节点的数据。

```typescript
import { $ } from "fluth";
const promise$ = $({ a: 1, b: { c: 2 } });
const observer1$ = promise$.$then((state) => (state.a = 3));
const observer2$ = observer1$.$then((state) => (state.a = 4));

console.log(promise$.value === observer1$.value); // false
console.log(observer1$.value === observer2$.value); // false

console.log(promise$.value.b === observer1$.value.b); // true
console.log(observer1$.value.b === observer2$.value.b); // true
```
