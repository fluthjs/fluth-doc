# get

Property extraction operator. Uses a getter function to extract a specific value from the source stream, and only emits a new value when the extracted value changes.

## Type Definition

```typescript
type get = <T, F>(
  getter: (value: T | undefined) => F
) => (observable$: Observable<T>) => Observable<F>
```

## Parameters

- `getter` (function): Extraction function, receives the value of the source stream and returns the part to extract
  - Parameter: `value: T | undefined` - The current value of the source stream
  - Return value: `F` - The extracted value

## Details

- Executes the `getter` function immediately upon creation to get the initial value
- Only emits a new value when the value returned by `getter` changes
- Uses strict equality (`===`) to compare whether the extracted value has changed

## Usage Scenarios

```typescript
import { $, get } from 'fluth'

const source$ = $({ a: 1, b: { c: 2 } })
const b$ = source$.pipe(get((value) => value?.b))

b$.then((value) => {
  console.log('b changed:', value)
})

console.log(b$.value) // { c: 2 }

// Modifying unrelated properties does not trigger
source$.set((value) => {
  value.a = 3
}) // No output

// Modifying related properties triggers
source$.set((value) => {
  value.b.c = 3
}) // Output: b changed: { c: 3 }
```

```typescript
import { $, get } from 'fluth'

const source$ = $({
  data: {
    users: [
      { name: 'Alice', settings: { theme: 'dark' } },
      { name: 'Bob', settings: { theme: 'light' } },
    ],
  },
})

const firstUserTheme$ = source$
  .pipe(get((value) => value?.data?.users))
  .pipe(get((users) => users?.[0]))
  .pipe(get((user) => user?.settings?.theme))

firstUserTheme$.then((theme) => {
  console.log('theme:', theme)
})

console.log(firstUserTheme$.value) // 'dark'

source$.set((value) => {
  value.data.users[0].settings.theme = 'light'
})
// Output: theme: light
```
