# delayExec

Delay execution plugin that delays pushing the processing result to child nodes at the current node for a specified time.

## Type Definition

```typescript
delayExec: (delayTime: number) => {
  execute: ({ result }: { result: Promise<any> | any }) => Promise<unknown>
}
```

## Parameters

- `delayTime` (required): Delay time in milliseconds

## Details

- Only executes at the current node, does not propagate to child nodes
- Wraps the result in a `Promise` and resolves after the specified time
- For `Promise` type results, waits for Promise resolution before starting the delay timer
- Precisely controls the timing of the data flow

## Examples

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
