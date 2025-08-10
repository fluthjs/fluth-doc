# TypeScript Type Support

## Automatic Inference of Initial Value Types

When using [$](/en/api/$) to create a stream, `fluth` will automatically infer the type of the initial value.

```typescript
import { $ } from 'fluth'
const promise$ = $({ a: '1', b: 2 })
promise$.value // {a: string, b: number}

const promise$ = $<{ a: string; b: number }>()
promise$.value // {a: string, b: number} | undefined
```

## Automatic Inference of Subscription Node Types

When using [then](/en/api/observable#then) to subscribe to a stream, `fluth` will automatically infer the type of the subscription node.

```typescript
import { $ } from 'fluth'
const promise$ = $({ a: '1', b: 2 })
// Automatically infers the type of the data parameter in then as {a: string, b: number}
const observable$ = promise$.then((data) => ({ c: state.a, d: state.b }))
// Automatically infers the type of data as {c: string, d: number}
observable$.value
```

## Automatic Inference of Operator Types

When using operators, `fluth` will automatically infer the operator types.

```typescript
import { $, get } from 'fluth'
const promise$ = $({ a: '1', b: 2 })
// Automatically infers the type of the data parameter in pipe as {a: string, b: number}
const observable$ = promise$.pipe(get((state) => state.a))
// Automatically infers the type of data as string
observable$.value
```
