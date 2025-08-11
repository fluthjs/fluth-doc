# Quick Start

## Installation

```bash
# npm
npm install fluth

# yarn
yarn add fluth

# pnpm
pnpm add fluth
```

## What is fluth?

fluth is a Promise-like stream programming library that allows a Promise to publish data repeatedly. If you are familiar with Promise, you already know the basics of fluth!

```typescript
// Promise can only publish once
const promise = Promise.resolve('hello')
promise.then(console.log) // Output: hello

// fluth can publish repeatedly
import { $ } from 'fluth'
const stream$ = $()
stream$.then(console.log)

stream$.next('hello') // Output: hello
stream$.next('world') // Output: world
stream$.next('!') // Output: !
```

## Step 1: Create and Subscribe to a Stream

### Create an empty stream

```typescript
import { $ } from 'fluth'

// Create an empty stream
const stream$ = $()

// Subscribe to data changes in the stream
stream$.then((data) => {
  console.log('Received data:', data)
})

// Push data
stream$.next('First message') // Output: Received data: First message
stream$.next('Second message') // Output: Received data: Second message
```

### Create a stream with an initial value

```typescript
// Create a stream with an initial value
const stream$ = $('initial value')

// Immediately triggers subscription (because there is an initial value)
stream$.thenImmediate((data) => {
  console.log('Received data:', data) // Output: initial value
}) // Output: Received data: initial value

// Continue to push new data
stream$.next('new data') // Output: Received data: new data
```

## Step 2: Chained Subscription

Like `Promise`, `fluth` supports chained operations:

```typescript
import { $ } from 'fluth'

const stream$ = $()

// Chain data processing
stream$
  .then((data) => data.toUpperCase()) // Convert to uppercase
  .then((data) => `[${data}]`) // Add brackets
  .then((data) => {
    console.log(data)
  })

stream$.next('hello') // Output: [HELLO]
stream$.next('world') // Output: [WORLD]
```

## Step 3: Push

You can push data using either the next or set method. The difference is:

- The next method directly pushes a new value, suitable for simple data types
- The set method automatically creates an immutable object, suitable for complex objects and handles deep copy automatically

### Use next to push new data

```typescript
const stream$ = $(0)

stream$.then((value) => {
  console.log('Current value:', value)
})

stream$.next(1) // Output: Current value: 1
stream$.next(2) // Output: Current value: 2
```

### Use set for immutable updates

```typescript
const stream$ = $({ key1: { key11: 'test' }, key2: { key22: 'test' } })
const oldValue = stream$.value

stream$.set((state) => {
  state.key2.key22 = 'test2' // Direct modification, fluth will create a new immutable object
})

// Verify immutability
console.log(oldValue === stream$.value) // false - root object reference changed
console.log(oldValue?.key2 === stream$.value?.key2) // false - modified object reference changed
console.log(oldValue?.key1 === stream$.value?.key1) // true - unchanged object reference remains the same
```

## Step 4: Partial Subscription

```typescript
import { $, change } from 'fluth'

const stream$ = $({ key1: { key11: 'test' }, key2: { key22: 'test' } })

stream$.pipe(change((state) => state.key2)).then((data) => {
  console.log('key2 changed')
})

stream$.set((state) => {
  state.key1.key11 = 'test1'
}) // No output

stream$.set((state) => {
  state.key2.key22 = 'test2'
}) // Output: key2 changed
```

## Step 5: Conditional Subscription

```typescript
import { $, filter } from 'fluth'
const stream$ = $()

// Only process even numbers
stream$.pipe(filter((num) => num % 2 === 0)).then((evenNum) => {
  console.log('Even number:', evenNum)
})

stream$.next(1) // No output
stream$.next(2) // Output: Even number: 2
stream$.next(3) // No output
stream$.next(4) // Output: Even number: 4
```

## Step 6: Stream Composition

### Combine the latest values of multiple streams

```typescript
import { $, combine } from 'fluth'

const name$ = $('john')
const age$ = $(25)

// Combine the latest values of two streams
const user$ = combine(name$, age$)

user$.then(([name, age]) => {
  console.log(`User: ${name}, Age: ${age}`)
})

// Only outputs when all streams have pushed data
name$.next('andy') // No output
age$.next(30) // Output: User: andy, Age: 30
name$.next('lucy') // Output: User: lucy, Age: 30
age$.next(31) // Output: User: lucy, Age: 31
```

### Wait for all streams to complete

```typescript
import { $, finish } from 'fluth'

const task1$ = $()
const task2$ = $()
const task3$ = $()

// Wait for all tasks to complete
const allTasks$ = finish(task1$, task2$, task3$)

allTasks$.then(([result1, result2, result3]) => {
  console.log('All tasks completed:', { result1, result2, result3 })
})

// Complete each task
task1$.next('Task 1 completed', true) // true means stream ends
task2$.next('Task 2 completed', true)
task3$.next('Task 3 completed', true)
// Output: All tasks completed: { result1: "Task 1 completed", result2: "Task 2 completed", result3: "Task 3 completed" }
```

## Step 7: Practical Application Scenarios

### Debounced User Input

```typescript
import { $, throttle } from 'fluth'

const searchInput$ = $()

// Use the throttle operator, control frequency to 300ms
searchInput$.pipe(throttle(300)).then((keyword) => {
  console.log('Search:', keyword)
  // Execute search logic
})

// Simulate fast user input
searchInput$.next('f')
searchInput$.next('fl')
searchInput$.next('flu')
searchInput$.next('fluth')
// Only outputs the last one: Search: fluth
```

#### Object State Management

```typescript
import { $ } from 'fluth'

// Application state
const appState$ = $({
  user: null,
  loading: false,
  error: null,
})

// Listen for user state changes
appState$
  .get((state) => state.user)
  .then((user) => {
    if (user) {
      console.log('User logged in:', user.name)
    } else {
      console.log('User not logged in')
    }
  })

// Listen for loading state changes
```
