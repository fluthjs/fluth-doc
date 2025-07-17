# delayExec

Delay execution plugin, delays passing the processing result to child nodes at the current node for a specified time.

## Type Definition

```typescript
delayExec: (delayTime: number) => {
  execute: ({ result }: { result: Promise<any> | any }) => Promise<unknown>
}
```

## Parameters

- `delayTime` (required): Delay time in milliseconds

## Return Value

Returns an ExecutePlugin that delays passing the execution result of the current node for the specified time.

## Core Behavior

- **execute plugin**: Only executes at the current node, does not propagate to child nodes
- **Delayed execution**: Wraps the result in a Promise and resolves after the specified time
- **Promise handling**: For Promise results, waits for resolution before starting the delay timer
- **Time control**: Precisely controls the timing of the data flow

## Usage Scenarios

### Scenario 1: Basic delay

```typescript
import { $ } from 'fluth'

const stream$ = $().use(delayExec(100))

stream$.then((value) => {
  console.log(value)
})

stream$.next(1)
// After 100ms, output: 1
```

### Scenario 2: Combined with other plugins

```typescript
import { $, consoleNode } from 'fluth'

const promise$ = $().use(delayExec(100), consoleNode())

promise$
  .then((value) => value + 1)
  .use(delayExec(100), consoleNode())
  .then((value) => value + 1)
  .use(delayExec(100), consoleNode())

promise$.next(1)
// After 100ms, output: resolve 1
// After 200ms, output: resolve 2
// After 300ms, output: resolve 3
```

### Scenario 3: Pipeline delay processing

```typescript
import { $ } from 'fluth'

const processingStream$ = $()

// Step 1: Data preprocessing (delay 200ms)
const preprocessed$ = processingStream$.use(delayExec(200)).then((data) => {
  console.log('Preprocessing done:', data)
  return { ...data, preprocessed: true }
})

// Step 2: Data validation (delay 300ms)
const validated$ = preprocessed$.use(delayExec(300)).then((data) => {
  console.log('Validation done:', data)
  return { ...data, validated: true }
})

// Step 3: Data storage (delay 150ms)
const stored$ = validated$.use(delayExec(150)).then((data) => {
  console.log('Storage done:', data)
  return { ...data, stored: true }
})

processingStream$.next({ id: 1, content: 'test data' })
// After 200ms: Preprocessing done: { id: 1, content: 'test data', preprocessed: true }
// After 300ms: Validation done: { id: 1, content: 'test data', preprocessed: true, validated: true }
// After 150ms: Storage done: { id: 1, content: 'test data', preprocessed: true, validated: true, stored: true }
```

### Scenario 4: API request rate limiting

```typescript
import { $ } from 'fluth'

const apiStream$ = $<string>()

// Limit API request frequency to avoid rate limiting
const rateLimitedAPI$ = apiStream$
  .use(delayExec(1000)) // Each request is spaced by 1 second
  .then(async (url) => {
    console.log('Requesting:', url)
    const response = await fetch(url)
    return response.json()
  })

rateLimitedAPI$.then((data) => {
  console.log('Request completed:', data)
})

// Quickly send multiple requests
apiStream$.next('https://api.example.com/users')
apiStream$.next('https://api.example.com/posts')
apiStream$.next('https://api.example.com/comments')

// Output:
// After 1s: Requesting: https://api.example.com/users
// After 1s: Requesting: https://api.example.com/posts
// After 1s: Requesting: https://api.example.com/comments
```

## Notes

1. **Return value**: The plugin always returns a Promise, even if the input is a synchronous value
2. **Promise handling**: For Promise results, waits for resolution before starting the delay timer
3. **Time accuracy**: Delay is based on `setTimeout`, actual delay may vary slightly
4. **Memory management**: Long delays may consume memory, clean up in time
5. **Error handling**: If the input Promise is rejected, the delay plugin will propagate the error directly

## Relationship with Other Plugins

- **vs debounce/throttle**: `delayExec` is a fixed delay, `debounce/throttle` are based on event frequency
- **Execution order**: Can be combined with other plugins and executed in chain order
- **Applicable scenarios**: `delayExec` is suitable for scenarios requiring precise time interval control
