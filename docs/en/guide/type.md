# TypeScript Type Support

## Automatic Type Inference for Initial Values

When creating streams using `$`, `fluth` automatically infers the type of the initial value.

```typescript
import { $ } from "fluth";
const promise$ = $({ a: "1", b: 2 });
promise$.value; // {a: string, b: number}

const promise$ = $<{ a: string; b: number }>();
promise$.value; // {a: string, b: number} | undefined
```

## Automatic Type Inference for Subscription Nodes

When subscribing to streams using `then`, `fluth` automatically infers the type of the subscription node.

```typescript
import { $ } from "fluth";
const promise$ = $({ a: "1", b: 2 });
const observable$ = promise$.then((data) => ({ c: state.a, d: state.b }));
observable$.value; // {c: string, d: number}
```

## Automatic Type Inference for Plugins

When using plugins, `fluth` automatically infers the type of the plugin.

```typescript
import { $, throttle } from "fluth";

const promise$ = $().use(throttle);

// Automatically infers whether the throttle method exists
const observable$ = promise$.throttle(1000).then().throttle(1000);
```
