# debugNode

Debugging plugin that triggers a debugger breakpoint at the current node based on conditions, used for precise debugging control.

:::warning Note
Browsers may filter out `debugger` statements in `node_modules`, causing breakpoints to not work. You may need to manually add `node_modules` to the ignore list in your browser's developer tools settings to enable debugging.
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

## Return Value

Returns an execute plugin that only triggers a debugger breakpoint at the current node based on the conditions.

## Core Behavior

- **execute plugin**: Only executes at the current node, does not propagate to child nodes
- **Conditional control**: Supports custom condition functions to control when the debugger is triggered
- **Separate handling for success/failure**: Can set different conditions for success and failure
- **Promise handling**: For Promise results, waits for resolution before checking the condition
- **Original data**: Returns the original `result` without modifying the data flow
- **Condition logic**: Triggers the debugger if the condition function returns `true`, otherwise does not trigger

## Usage Scenarios

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

## Notes

1. **Return value**: The plugin always returns the original `result` and does not modify the data flow
2. **Promise handling**: For Promise results, waits for resolution before checking the condition
3. **Condition function**: The condition function receives the resolved value; triggers the debugger if returns `true`, otherwise does not trigger
4. **Error condition**: The error condition function receives the error object; triggers the debugger if returns `true`, otherwise does not trigger
5. **Remove plugin**: Can be removed via the `remove` method to stop debugging
6. **Development environment**: The debugger is mainly for development; remove in production

## Relationship with Other Plugins

- **vs debugAll**: `debugNode` only triggers debugger at a single node; `debugAll` triggers at all nodes
- **vs consoleNode**: Similar function, but `debugNode` triggers debugger breakpoints, `consoleNode` outputs to the console
- **Applicable scenarios**: `debugNode` is suitable for precise control of debugging points, only triggering at specific nodes or under certain conditions
