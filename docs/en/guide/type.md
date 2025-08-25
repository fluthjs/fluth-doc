# TypeScript Type Support

## Automatic Type Inference for Initial Values

When using [$](/en/api/$) to create a stream, fluth will automatically infer the type of the initial value.

```typescript
import { $ } from 'fluth'
const promise$ = $({ a: '1', b: 2 })
promise$.value // {a: string, b: number}

const promise$ = $<{ a: string; b: number }>()
promise$.value // {a: string, b: number} | undefined
```

## Automatic Type Inference for Subscription Nodes

When using [then](/en/api/observable.html#then) to subscribe to a stream, fluth will automatically infer the type of the subscription node.

```typescript
import { $ } from 'fluth'
const promise$ = $({ a: '1', b: 2 })
// Automatically infers the type of the then data parameter as {a: string, b: number}
const observable$ = promise$.then((data) => ({ c: data.a, d: data.b }))
// Automatically infers the type of data as {c: string, d: number}
observable$.value
```

## Automatic Type Inference for Operators

When using operators, fluth will automatically infer the operator types.

```typescript
import { $, get } from 'fluth'
const promise$ = $({ a: '1', b: 2 })
// Automatically infers the type of the pipe data parameter as {a: string, b: number}
const observable$ = promise$.pipe(get((state) => state.a))
// Automatically infers the type of data as string
observable$.value
```
