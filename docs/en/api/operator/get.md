# get

A property extraction operator that uses a getter function to extract specific values from the source stream, emitting new values only when the extracted value changes.

## Type Definition

```typescript
type get = <T, F>(
  getter: (value: T | undefined) => F
) => (observable$: Observable<T>) => Observable<F>
```

## Parameters

- `getter` (function): Extraction function that receives the source stream value and returns the part to be extracted
  - Parameter: `value: T | undefined` - Current value of the source stream
  - Return value: `F` - The extracted value

## Return Value

Returns a new `Observable<F>` that contains values extracted through the getter function, emitting new values only when the extracted value changes.

## Details

Core behaviors of the `get` operator:

- **Immediate execution**: Executes the getter function immediately upon creation to get the initial value
- **Change detection**: Only emits new values when the getter's return value changes
- **Deep extraction**: Supports extraction of deeply nested properties
- **Null safety**: Safely handles undefined and null values
- **Value comparison**: Uses strict equality (===) to compare whether extracted values have changed

## Usage Scenarios

### Scenario 1: Basic Property Extraction

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

### Scenario 2: Deep Nested Property Extraction

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

### Scenario 3: Array Property Extraction

```typescript
import { $, get } from 'fluth'

const source$ = $({ items: [1, 2, 3] })
const length$ = source$.pipe(get((value) => value?.items?.length))

length$.then((length) => {
  console.log('length:', length)
})

console.log(length$.value) // 3

source$.set((value) => {
  value.items.push(4)
})
// Output: length: 4
```

### Scenario 4: Primitive Type Property Extraction

```typescript
import { $, get } from 'fluth'

const source$ = $('hello world')
const length$ = source$.pipe(get((value) => value?.length))

length$.then((length) => {
  console.log('string length:', length)
})

console.log(length$.value) // 11

source$.next('hi')
// Output: string length: 2
```

### Scenario 5: Complex Calculation Transformation

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

### Scenario 6: Chained get Operations

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

## Edge Case Handling

### Handling undefined Values

```typescript
import { $, get } from 'fluth'

const source$ = $<string | undefined>(undefined)
const length$ = source$.pipe(get((value) => value?.length))

length$.then((length) => {
  console.log('length:', length)
})

console.log(length$.value) // undefined

source$.next('hello')
// Output: length: 5
```

### Handling null Values

```typescript
import { $, get } from 'fluth'

const source$ = $<{ data?: string } | null>(null)
const data$ = source$.pipe(get((value) => value?.data))

data$.then((data) => {
  console.log('data:', data)
})

console.log(data$.value) // undefined

source$.next({ data: 'hello' })
// Output: data: hello
```

### Handling Empty Values

```typescript
import { $, get } from 'fluth'

// Empty string
const emptyString$ = $('')
const length$ = emptyString$.pipe(get((value) => value?.length))
console.log(length$.value) // 0

// Empty array
const emptyArray$ = $<number[]>([])
const arrayLength$ = emptyArray$.pipe(get((value) => value?.length))
console.log(arrayLength$.value) // 0

// Empty object
const emptyObject$ = $({})
const keyCount$ = emptyObject$.pipe(get((value) => Object.keys(value || {}).length))
console.log(keyCount$.value) // 0
```

### Handling Special Numeric Values

```typescript
import { $, get } from 'fluth'

// Handling 0
const zero$ = $(0)
const doubled$ = zero$.pipe(get((value) => (value ?? 0) * 2))
console.log(doubled$.value) // 0

// Handling false
const false$ = $(false)
const negated$ = false$.pipe(get((value) => !value))
console.log(negated$.value) // true

// Handling NaN
const nan$ = $(NaN)
const isValid$ = nan$.pipe(get((value) => !isNaN(value ?? NaN)))
console.log(isValid$.value) // false
```

## Important Notes

1. **Immediate execution**: The get operator executes the getter function immediately upon creation
2. **Change detection**: Only emits new values when the getter's return value changes
3. **Null safety**: Should use optional chaining operator (?.) to safely access properties
4. **Value comparison**: Uses strict equality (===) to compare value changes
5. **Performance considerations**: Getter functions should be simple and avoid complex calculations

## Relationship with Other Operators

- Difference from `filter`: `get` extracts values, `filter` filters values
- Difference from `then`: `get` only emits when extracted values change, `then` executes every time source values change
- Difference from `change`: `get` extracts specific parts, `change` detects changes in entire values

## Complete Example

```typescript
import { $, get } from 'fluth'

// Create user state management
const userState$ = $({
  user: {
    id: 1,
    profile: {
      name: 'Alice',
      email: 'alice@example.com',
      settings: {
        theme: 'dark',
        notifications: true,
      },
    },
  },
  ui: {
    loading: false,
    error: null,
  },
})

// Extract username
const userName$ = userState$.pipe(get((state) => state?.user?.profile?.name))

// Extract theme settings
const theme$ = userState$.pipe(get((state) => state?.user?.profile?.settings?.theme))

// Extract loading state
const loading$ = userState$.pipe(get((state) => state?.ui?.loading))

// Listen for changes
userName$.then((name) => {
  console.log('Username changed:', name)
})

theme$.then((theme) => {
  console.log('Theme changed:', theme)
})

loading$.then((loading) => {
  console.log('Loading state:', loading)
})

// Modify username
userState$.set((state) => {
  state.user.profile.name = 'Bob'
})
// Output: Username changed: Bob

// Modify theme
userState$.set((state) => {
  state.user.profile.settings.theme = 'light'
})
// Output: Theme changed: light

// Modify loading state
userState$.set((state) => {
  state.ui.loading = true
})
// Output: Loading state: true

// Modifying unrelated properties won't trigger any output
userState$.set((state) => {
  state.user.id = 2
})
```

## Array Processing Example

```typescript
import { $, get } from 'fluth'

const source$ = $<(string | undefined)[]>(['a', undefined, 'c'])

// Filter out undefined elements
const filtered$ = source$.pipe(get((value) => value?.filter(Boolean)))

filtered$.then((filtered) => {
  console.log('Filtered array:', filtered)
})

console.log(filtered$.value) // ['a', 'c']

source$.next([undefined, 'b', undefined])
// Output: Filtered array: ['b']
```
