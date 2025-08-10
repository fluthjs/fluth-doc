# get

Property extraction operator that uses a getter function to extract specific values from a source stream, only emitting new values when the extracted value changes.

<div style="display: flex; justify-content: center">
  <img src="/get.drawio.svg" alt="image" >
</div>

## Type Definition

```typescript
const get =
  <T, F>(getter: (value: T | undefined) => F) =>
  (observable$: Observable<T>) =>
    Observable<F>
```

## Parameters

- getter: Extraction function that receives the source stream's value and returns the part to be extracted
  - Parameter: value: T | undefined - Current value of the source stream
  - Return value: F - Extracted value

## Details

- Executes the getter function immediately upon creation to get the initial value
- Can listen to changes in nested object properties
- Avoids unnecessary repeated calculations and triggers

## Examples

### Basic Property Extraction

```typescript
import { $, get } from 'fluth'

const source$ = $({ a: 1, b: { c: 2 } })
const b$ = source$.pipe(get((value) => value?.b))

b$.then((value) => {
  console.log('b changed:', value)
})

console.log(b$.value) // { c: 2 }

// Modifying unrelated properties won't trigger
source$.set((value) => {
  value.a = 3
}) // No output

// Modifying related properties will trigger
source$.set((value) => {
  value.b.c = 3
}) // Output: b changed: { c: 3 }
```

### Nested Property Extraction

```typescript
import { $, get } from 'fluth'

const source$ = $({ user: { profile: { name: 'Alice', age: 25 } } })
const name$ = source$.pipe(get((value) => value?.user?.profile?.name))

name$.then((name) => {
  console.log('name:', name)
})

console.log(name$.value) // 'Alice'

source$.set((value) => {
  value.user.profile.name = 'Bob'
})

// Output: name: Bob
```

### Computed Value Extraction

```typescript
import { $, get } from 'fluth'

const source$ = $({ x: 3, y: 4 })
const distance$ = source$.pipe(
  get((value) => (value ? Math.sqrt(value.x * value.x + value.y * value.y) : 0))
)

distance$.then((distance) => {
  console.log('distance:', distance)
})

console.log(distance$.value) // 5

source$.set((value) => {
  value.x = 6
  value.y = 8
})

// Output: distance: 10
```

### Handling Undefined Values

```typescript
import { $, get } from 'fluth'

const source$ = $<{ data?: { value: number } }>()
const value$ = source$.pipe(get((value) => value?.data?.value))

value$.then((val) => {
  console.log('value:', val)
})

console.log(value$.value) // undefined

source$.next({ data: { value: 42 } })

// Output: value: 42
```
