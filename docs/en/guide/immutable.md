# Immutable Data

`fluth` supports immutable data, implemented using [`limu`](https://tnfe.github.io/limu/).

## Stream

The `set` method of the `Stream` object can immutably modify node data.

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

The `$then`, `$thenOnce`, `$thenImmediate` methods of the `Observable` object can also immutably modify node data.

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
