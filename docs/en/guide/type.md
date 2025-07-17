# TypeScript Support

## Automatic Type Inference for Initial Values

When using `$` to create streams, `fluth` automatically infers the type of initial values.

```typescript
import { $ } from "fluth";
const promise$ = $({ a: "1", b: 2 });
promise$.value; // {a: string, b: number}

const promise$ = $<{ a: string; b: number }>();
promise$.value; // {a: string, b: number} | undefined
```

## Automatic Type Inference for Subscription Nodes

When using `then` to subscribe to streams, `fluth` automatically infers the type of subscription nodes.

```typescript
import { $ } from "fluth";
const promise$ = $({ a: "1", b: 2 });
const observable$ = promise$.then((data) => ({ c: state.a, d: state.b }));
observable$.value; // {c: string, d: number}
```

## Automatic Type Inference for Plugins

When using plugins, `fluth` automatically infers plugin types.

```typescript
import { $, throttle } from "fluth";

const promise$ = $().use(throttle);

// Can automatically infer whether throttle method exists
const observable$ = promise$.throttle(1000).then().throttle(1000);
```
