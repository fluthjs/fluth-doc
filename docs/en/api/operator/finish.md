# finish

Waits for all input [Streams](/en/api/stream#stream) or [Observables](/en/api/observable) to finish, then combines their final values into an array and emits it.

![image](/finish.drawio.svg)

## Type Definition

```typescript
type finish = <T extends (Stream | Observable)[]>(...args$: T) => Stream<StreamTupleValues<T>>
```

## Parameters

- `...args$`: Multiple Stream or Observable instances

## Return Value

Returns a new Stream that emits an array containing all final values after all input streams have finished.

## Core Behavior

- **Wait for all streams to finish**: Only emits data when all input streams have finished
- **Collect final values**: Collects the final value (value at completion) from each input stream
- **One-time emission**: Emits data once and immediately finishes
- **Error state propagation**: If any input stream finishes with error state, the result stream also finishes with error state

## Execution Mechanism

1. **Listen for completion**: Uses `afterComplete` to listen for completion state of each input stream
2. **Collect final values**: When a stream finishes, collects its final value at the corresponding position
3. **Count check**: When all streams are complete, checks for error states
4. **Emit result**: Emits success or failure result array based on error state
5. **Unsubscription management**: Uses `useUnsubscribeCallback` to manage unsubscription logic

## Usage Scenarios

### Scenario 1: Basic Multi-Stream Completion Wait

```typescript
import { $, finish } from 'fluth'

const stream1$ = $(1)
const stream2$ = $('hello')
const stream3$ = $(true)

const finish$ = finish(stream1$, stream2$, stream3$)
finish$.then((value) => console.log('All streams completed:', value))

console.log(finish$.value) // Output: undefined

// Intermediate values don't trigger finish
stream1$.next(2)
stream2$.next('world')
stream3$.next(false)

// Only when all streams finish will data be emitted
stream1$.next(3, true) // Finish stream1$, final value is 3
stream2$.next('final', true) // Finish stream2$, final value is 'final'
stream3$.next(true, true) // Finish stream3$, final value is true

// Output: All streams completed: [3, 'final', true]
```

### Scenario 2: Async Task Completion Wait

```typescript
import { $, finish } from 'fluth'

// Simulate three async tasks
const task1$ = $()
const task2$ = $()
const task3$ = $()

const allTasks$ = finish(task1$, task2$, task3$)

allTasks$.then(
  (results) => console.log('All tasks completed:', results),
  (errors) => console.log('Task execution failed:', errors)
)

// Execute async tasks
setTimeout(() => {
  task1$.next('Task 1 completed', true)
}, 1000)

setTimeout(() => {
  task2$.next('Task 2 completed', true)
}, 2000)

setTimeout(() => {
  task3$.next('Task 3 completed', true)
}, 1500)

// After 2 seconds output: All tasks completed: ['Task 1 completed', 'Task 2 completed', 'Task 3 completed']
```

### Scenario 3: Error State Handling

```typescript
import { $, finish } from 'fluth'

const successStream$ = $()
const errorStream$ = $()
const normalStream$ = $()

const result$ = finish(successStream$, errorStream$, normalStream$)

result$.then(
  (values) => console.log('All successful:', values),
  (values) => console.log('Contains errors:', values)
)

// Normal completion
successStream$.next('Success data', true)
normalStream$.next('Normal data', true)

// Error completion
errorStream$.next(Promise.reject('Error data'), true)

// Output: Contains errors: ['Success data', 'Error data', 'Normal data']
```

### Scenario 4: Data Processing Pipeline Wait

```typescript
import { $, finish } from 'fluth'

// Create multiple data processing pipelines
const dataProcessor1$ = $()
const dataProcessor2$ = $()
const dataProcessor3$ = $()

// Processing pipeline 1: Data cleaning
const cleaningPipeline$ = dataProcessor1$
  .then((data) => {
    console.log('Starting data cleaning...')
    return data.filter((item) => item != null)
  })
  .then((cleaned) => {
    console.log('Data cleaning completed:', cleaned.length, 'records')
    return cleaned
  })

// Processing pipeline 2: Data validation
const validationPipeline$ = dataProcessor2$
  .then((data) => {
    console.log('Starting data validation...')
    return data.filter((item) => item.id && item.name)
  })
  .then((validated) => {
    console.log('Data validation completed:', validated.length, 'valid records')
    return validated
  })

// Processing pipeline 3: Data transformation
const transformPipeline$ = dataProcessor3$
  .then((data) => {
    console.log('Starting data transformation...')
    return data.map((item) => ({
      ...item,
      processed: true,
      timestamp: Date.now(),
    }))
  })
  .then((transformed) => {
    console.log('Data transformation completed')
    return transformed
  })

// Wait for all pipelines to complete
const allPipelines$ = finish(cleaningPipeline$, validationPipeline$, transformPipeline$)

allPipelines$.then((results) => {
  const [cleaned, validated, transformed] = results
  console.log('All data processing completed:')
  console.log('- Cleaned data:', cleaned.length, 'records')
  console.log('- Validated data:', validated.length, 'records')
  console.log('- Transformed data:', transformed.length, 'records')
})

// Simulate data input
const rawData = [
  { id: 1, name: 'Alice' },
  { id: null, name: 'Bob' },
  { id: 2, name: 'Charlie' },
  null,
  { id: 3, name: '' },
]

dataProcessor1$.next(rawData, true)
dataProcessor2$.next(rawData, true)
dataProcessor3$.next(rawData, true)
```

### Scenario 5: Resource Loading Completion Wait

```typescript
import { $, finish } from 'fluth'

// Simulate resource loading
const imageLoader$ = $()
const scriptLoader$ = $()
const styleLoader$ = $()

const allResources$ = finish(imageLoader$, scriptLoader$, styleLoader$)

allResources$.then(
  (resources) => {
    console.log('All resources loaded:', resources)
    // Start application
    startApplication()
  },
  (errors) => {
    console.error('Resource loading failed:', errors)
    showErrorMessage()
  }
)

// Simulate image loading
setTimeout(() => {
  const img = new Image()
  img.onload = () => imageLoader$.next('Image loaded successfully', true)
  img.onerror = () => imageLoader$.next(Promise.reject('Image loading failed'), true)
  img.src = '/path/to/image.jpg'
}, 500)

// Simulate script loading
setTimeout(() => {
  const script = document.createElement('script')
  script.onload = () => scriptLoader$.next('Script loaded successfully', true)
  script.onerror = () => scriptLoader$.next(Promise.reject('Script loading failed'), true)
  script.src = '/path/to/script.js'
  document.head.appendChild(script)
}, 800)

// Simulate style loading
setTimeout(() => {
  const link = document.createElement('link')
  link.onload = () => styleLoader$.next('Style loaded successfully', true)
  link.onerror = () => styleLoader$.next(Promise.reject('Style loading failed'), true)
  link.rel = 'stylesheet'
  link.href = '/path/to/style.css'
  document.head.appendChild(link)
}, 300)

function startApplication() {
  console.log('Starting application...')
}

function showErrorMessage() {
  console.log('Showing error message...')
}
```

## Important Features

### 1. Only Cares About Final Values

```typescript
import { $, finish } from 'fluth'

const stream$ = $()
const result$ = finish(stream$)

result$.then((values) => console.log('Final values:', values))

// Intermediate values don't trigger finish
stream$.next('First value')
stream$.next('Second value')
stream$.next('Third value')

// Only the value at completion is collected
stream$.next('Final value', true)
// Output: Final values: ['Final value']
```

### 2. Error State Propagation

```typescript
import { $, finish } from 'fluth'

const stream1$ = $()
const stream2$ = $()

const result$ = finish(stream1$, stream2$)

result$.then(
  (values) => console.log('Success:', values),
  (values) => console.log('Failure:', values)
)

// One stream succeeds, one stream errors
stream1$.next('Success', true)
stream2$.next(Promise.reject('Failure'), true)

// Output: Failure: ['Success', 'Failure']
// Note: Even with errors, all values are collected
```

### 3. Unsubscription Propagation

```typescript
import { $, finish } from 'fluth'

const stream1$ = $()
const stream2$ = $()
const stream3$ = $()

const result$ = finish(stream1$, stream2$, stream3$)

result$.afterUnsubscribe(() => {
  console.log('finish stream unsubscribed')
})

// When all input streams unsubscribe, result stream also unsubscribes
stream1$.unsubscribe()
stream2$.unsubscribe()
stream3$.unsubscribe()

// Output: finish stream unsubscribed
```

## Important Notes

1. **Memory management**: finish holds references to all input streams until completion, be careful to avoid memory leaks
2. **Error handling**: Error state from any input stream causes the entire result to be in error state
3. **Order guarantee**: Values in result array maintain the same order as input streams
4. **One-time operation**: finish stream only emits data once, then immediately finishes
5. **Unsubscription**: Result stream only unsubscribes when all input streams unsubscribe

## Relationship with Other Operators

- **vs combine**: finish waits for all streams to finish, combine emits when any stream updates
- **vs promiseAll**: finish handles Stream/Observable, promiseAll handles Promise arrays
- **vs merge**: finish collects final values, merge merges timing of all values
- **Use cases**: finish is suitable for scenarios waiting for multiple async tasks to complete

## Real-world Application Example

### Microservice Data Aggregation

```typescript
import { $, finish } from 'fluth'

// Simulate microservice API calls
const userService$ = $()
const orderService$ = $()
const productService$ = $()

// Aggregate all service data
const aggregatedData$ = finish(userService$, orderService$, productService$)

aggregatedData$.then(
  ([userData, orderData, productData]) => {
    // All service data retrieved successfully
    const dashboard = {
      user: userData,
      orders: orderData,
      products: productData,
      aggregatedAt: new Date().toISOString(),
    }

    console.log('Dashboard data aggregation completed:', dashboard)
    renderDashboard(dashboard)
  },
  ([userError, orderError, productError]) => {
    // At least one service call failed
    console.error('Service call failed:', {
      userService: userError,
      orderService: orderError,
      productService: productError,
    })
    showErrorPage()
  }
)

// Simulate API calls
async function fetchUserData() {
  try {
    const response = await fetch('/api/users')
    const data = await response.json()
    userService$.next(data, true)
  } catch (error) {
    userService$.next(Promise.reject(error), true)
  }
}

async function fetchOrderData() {
  try {
    const response = await fetch('/api/orders')
    const data = await response.json()
    orderService$.next(data, true)
  } catch (error) {
    orderService$.next(Promise.reject(error), true)
  }
}

async function fetchProductData() {
  try {
    const response = await fetch('/api/products')
    const data = await response.json()
    productService$.next(data, true)
  } catch (error) {
    productService$.next(Promise.reject(error), true)
  }
}

// Start data fetching
fetchUserData()
fetchOrderData()
fetchProductData()

function renderDashboard(data) {
  console.log('Rendering dashboard...')
}

function showErrorPage() {
  console.log('Showing error page...')
}
```
