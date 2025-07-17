# debugNode

Debug plugin that triggers debugger breakpoints at the current node based on conditions, used for precise debugging control.

:::warning Note
Browsers may filter `debugger` statements in `node_modules`, causing debugger breakpoints to not work. You need to manually enable debugging for `node_modules` in browser developer tools -> settings -> ignore list.
:::

## Type Definition

```typescript
debugNode: (condition?: (value: any) => boolean, conditionError?: (value: any) => boolean) => {
  execute: ({ result }: { result: Promise<any> | any }) => any
}
```

## Parameters

- `condition` (optional): Condition function for successful results, triggers debugger when returns `true`, does not trigger when returns `false`, defaults to `undefined` (always triggers)
- `conditionError` (optional): Condition function for failed results, triggers debugger when returns `true`, does not trigger when returns `false`, defaults to `undefined` (always triggers)

## Return Value

Returns an execute plugin that triggers debugger breakpoints at the current node based on conditions.

## Core Behavior

- **execute plugin**: Only executes at the current node, does not propagate to child nodes
- **Condition control**: Supports custom condition functions to control debugger triggering
- **Success/failure separate handling**: Can set different conditions for success and failure cases
- **Promise handling**: For Promise-type results, waits for Promise resolution before checking conditions
- **Original data**: Returns the original `result` without modifying the data stream
- **Condition logic**: Triggers debugger when condition function returns `true`, does not trigger when returns `false`

## Usage Scenarios

### Scenario 1: Basic Usage (Always Trigger)

```typescript
import { $ } from 'fluth'

const promise$ = $().use(debugNode())

promise$.then((value) => value + 1).then((value) => value + 1)

promise$.next(1)
// Will trigger debugger breakpoint in browser developer tools
```

### Scenario 2: Conditional Debugging (Only Trigger for Specific Values)

```typescript
import { $ } from 'fluth'

// Only trigger debugger when value is greater than 5
const promise$ = $().use(debugNode((value) => value > 5))

promise$.then((value) => value + 1)

promise$.next(3) // Won't trigger debugger (3 <= 5, condition returns false)
promise$.next(6) // Will trigger debugger (6 > 5, condition returns true)
```

### Scenario 3: Error Condition Debugging

```typescript
import { $ } from 'fluth'

// Only trigger debugger when error message contains 'critical'
const promise$ = $().use(debugNode(undefined, (error) => error.message.includes('critical')))

promise$.then((value) => value + 1)

const normalError = Promise.reject(new Error('normal error'))
promise$.next(normalError) // Won't trigger debugger (doesn't contain 'critical', condition returns false)

const criticalError = Promise.reject(new Error('critical error'))
promise$.next(criticalError) // Will trigger debugger (contains 'critical', condition returns true)
```

### Scenario 4: Setting Both Success and Failure Conditions

```typescript
import { $ } from 'fluth'

// Set both success and failure conditions
const promise$ = $().use(
  debugNode(
    (value) => value > 10, // For success, trigger only when value > 10
    (error) => error.message.includes('fatal') // For failure, trigger only when error contains 'fatal'
  )
)

promise$.then((value) => value + 1)

promise$.next(5) // Won't trigger debugger (5 <= 10, condition returns false)
promise$.next(15) // Will trigger debugger (15 > 10, condition returns true)

const fatalError = Promise.reject(new Error('fatal error'))
promise$.next(fatalError) // Will trigger debugger (contains 'fatal', condition returns true)

const normalError = Promise.reject(new Error('normal error'))
promise$.next(normalError) // Won't trigger debugger (doesn't contain 'fatal', condition returns false)
```

### Scenario 5: Complex Condition Logic

```typescript
import { $ } from 'fluth'

interface UserData {
  id: number
  name: string
  role: string
  active: boolean
}

// Only trigger debugger for admin users who are inactive
const userStream$ = $<UserData>().use(debugNode((user) => user.role === 'admin' && !user.active))

userStream$.then((user) => {
  console.log('Processing user:', user.name)
  return { ...user, processed: true }
})

userStream$.next({ id: 1, name: 'John', role: 'user', active: true })
// Won't trigger debugger (not admin, condition returns false)

userStream$.next({ id: 2, name: 'Admin', role: 'admin', active: true })
// Won't trigger debugger (admin but active, condition returns false)

userStream$.next({ id: 3, name: 'InactiveAdmin', role: 'admin', active: false })
// Will trigger debugger (admin and inactive, condition returns true)
```

### Scenario 6: Plugin Removal

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

## Important Notes

1. **Return value**: The plugin returns the original `result` without modifying the data stream
2. **Promise handling**: For Promise-type results, waits for Promise resolution before checking conditions
3. **Condition function**: The condition function receives the resolved value as parameter, triggers debugger when returns `true`, does not trigger when returns `false`
4. **Error condition**: The error condition function receives the error object as parameter, triggers debugger when returns `true`, does not trigger when returns `false`
5. **Plugin removal**: Can be removed via the `remove` method to stop debugging functionality
6. **Development environment**: Debugger functionality is mainly used in development environments, should be removed in production
7. **Browser support**: Requires an environment that supports `debugger` statements (browser developer tools)

## Relationship with Other Plugins

- **vs debugAll**: `debugNode` only triggers debugger at a single node, while `debugAll` triggers at all nodes in the stream chain
- **vs consoleNode**: Similar functionality, but `debugNode` triggers debugger breakpoints while `consoleNode` outputs to console
- **Use cases**: `debugNode` is suitable for precise debugging control, debugging specific nodes only under specific conditions

## Best Practices

1. **Precise debugging**: Use condition functions to precisely control debugging points, avoid over-debugging
2. **Error focus**: Set specific conditions for error cases to quickly locate issues
3. **Performance consideration**: Condition functions should be as simple as possible, avoid complex calculations
4. **Production removal**: Remove all debugging plugins in production environments
5. **Combined usage**: Can be combined with other debugging plugins to form a complete debugging strategy
