# debugNode

Debugging plugin that triggers a debugger breakpoint at the current node based on conditions, used for precise debugging control.

:::warning Note
Browsers may filter out `debugger` statements in `node_modules`, causing breakpoints to not work. You may need to manually enable `node_modules` debugging in your browser's developer tools settings -> ignore list.
:::

## Type Definition

```typescript
debugNode: (condition?: (value: any) => boolean, conditionError?: (value: any) => boolean) => {
  execute: ({ result }: { result: Promise<any> | any }) => any
}
```

## Parameters

- `condition` (optional): Condition function for success; triggers the debugger if returns `true`, otherwise does not trigger. Default is `undefined` (always triggers)
- `conditionError` (optional): Condition function for failure; triggers the debugger if returns `true`, otherwise does not trigger. Default is `undefined` (always triggers)

## Details

- Only executes at the current node, does not propagate to child nodes
- Supports custom condition functions to control when the debugger is triggered
- Can set different conditions for success and failure scenarios
- For `Promise` type results, waits for Promise resolution before checking the condition
- Returns the original `result` without modifying the data flow
- Triggers the debugger when the condition function returns `true`, otherwise does not trigger

## Examples

### Scenario 1: Basic usage (always triggers)

```typescript
import { $ } from 'fluth'

const promise$ = $().use(debugNode())

promise$.then((value) => value + 1).then((value) => value + 1)

promise$.next(1)
// A debugger breakpoint will be triggered in browser devtools
```

### Scenario 2: Conditional debugging (trigger only for specific values)

```typescript
import { $ } from 'fluth'

// Only trigger debugger when value > 5
const promise$ = $().use(debugNode((value) => value > 5))

promise$.then((value) => value + 1)

promise$.next(3) // Will not trigger debugger (3 <= 5, condition returns false)
promise$.next(6) // Will trigger debugger (6 > 5, condition returns true)
```

### Scenario 3: Error condition debugging

```typescript
import { $ } from 'fluth'

// Only trigger debugger when error message contains 'critical'
const promise$ = $().use(debugNode(undefined, (error) => error.message.includes('critical')))

promise$.then((value) => value + 1)

const normalError = Promise.reject(new Error('normal error'))
promise$.next(normalError) // Will not trigger debugger (does not contain 'critical', condition returns false)

const criticalError = Promise.reject(new Error('critical error'))
promise$.next(criticalError) // Will trigger debugger (contains 'critical', condition returns true)
```

### Scenario 4: Set both success and failure conditions

```typescript
import { $ } from 'fluth'

// Set different conditions for success and failure
const promise$ = $().use(
  debugNode(
    (value) => value > 10, // For success, trigger only if value > 10
    (error) => error.message.includes('fatal') // For failure, trigger only if error contains 'fatal'
  )
)

promise$.then((value) => value + 1)

promise$.next(5) // Will not trigger debugger (5 <= 10, condition returns false)
promise$.next(15) // Will trigger debugger (15 > 10, condition returns true)

const fatalError = Promise.reject(new Error('fatal error'))
promise$.next(fatalError) // Will trigger debugger (contains 'fatal', condition returns true)

const normalError = Promise.reject(new Error('normal error'))
promise$.next(normalError) // Will not trigger debugger (does not contain 'fatal', condition returns false)
```

### Scenario 5: Complex condition judgment

```typescript
import { $ } from 'fluth'

interface UserData {
  id: number
  name: string
  role: string
  active: boolean
}

// Only trigger debugger for inactive admin users
const userStream$ = $<UserData>().use(debugNode((user) => user.role === 'admin' && !user.active))

userStream$.then((user) => {
  console.log('Processing user:', user.name)
  return { ...user, processed: true }
})

userStream$.next({ id: 1, name: 'John', role: 'user', active: true })
// Will not trigger debugger (not admin, condition returns false)

userStream$.next({ id: 2, name: 'Admin', role: 'admin', active: true })
// Will not trigger debugger (admin but active, condition returns false)

userStream$.next({ id: 3, name: 'InactiveAdmin', role: 'admin', active: false })
// Will trigger debugger (admin and inactive, condition returns true)
```

### Scenario 6: Remove plugin

```typescript
import { $ } from 'fluth'

const plugin = debugNode()
const stream$ = $().use(plugin)

let callCount = 0
stream$.then((value) => {
  callCount++
  return value
})

stream$.next(1)
// Triggers debugger, callCount = 1

stream$.remove(plugin)
stream$.next(2)
// No longer triggers debugger, callCount = 2
```
