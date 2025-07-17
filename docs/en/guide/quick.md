# Quick Start

## Installation

```bash
pnpm i fluth
```

## What is fluth?

`fluth` is a Promise-like streaming programming library that allows `Promise` to publish data continuously. If you're familiar with `Promise`, you already know the basics of `fluth`!

```typescript
// Promise can only publish once
const promise = Promise.resolve("hello");
promise.then(console.log); // Output: hello

// fluth can publish continuously
import { $ } from "fluth";
const stream$ = $();
stream$.then(console.log);

stream$.next("hello"); // Output: hello
stream$.next("world"); // Output: world
stream$.next("!"); // Output: !
```

## Step 1: Create and Subscribe to Streams

### Create Empty Stream

```typescript
import { $ } from "fluth";

// Create an empty stream
const stream$ = $();

// Subscribe to stream data changes
stream$.then((data) => {
  console.log("Received data:", data);
});

// Push data
stream$.next("First message");
stream$.next("Second message");
```

### Create Stream with Initial Value

```typescript
// Create stream with initial value
const stream$ = $("Initial value");

// Immediately trigger subscription (because there's an initial value)
stream$.then((data) => {
  console.log(data); // Output: Initial value
});

// Continue pushing new data
stream$.next("New data");
```

## Step 2: Chained Subscription

Just like `Promise`, `fluth` supports chained operations:

```typescript
import { $ } from "fluth";

const stream$ = $();

// Chain data processing
stream$
  .then((data) => data.toUpperCase()) // Convert to uppercase
  .then((data) => `[${data}]`) // Add brackets
  .then((data) => {
    console.log(data);
  });

stream$.next("hello"); // Output: [HELLO]
stream$.next("world"); // Output: [WORLD]
```

## Step 3: Data Push

Data push can be done using either the `next` method or the `set` method. The difference between them is:

- The `next` method directly pushes new values, suitable for simple data types
- The `set` method automatically creates immutable objects, suitable for complex objects, automatically handling deep copying

### Push New Data Using next

```typescript
const stream$ = $(0);

stream$.then((value) => {
  console.log("Current value:", value);
});

stream$.next(1); // Output: Current value: 1
stream$.next(2); // Output: Current value: 2
```

### Use set for Immutable Updates

```typescript
const stream$ = $({ key1: { key11: "test" }, key2: { key22: "test" } });
const oldValue = stream$.value;

stream$.set((state) => {
  state.key2.key22 = "test2"; // Direct modification, fluth will create new immutable objects
});

// Verify immutability
console.log(oldValue === stream$.value); // false - root object reference has changed
console.log(oldValue?.key2 === stream$.value?.key2); // false - modified object reference has changed
console.log(oldValue?.key1 === stream$.value?.key1); // true - unmodified object reference remains unchanged
```

## Step 4: Conditional Subscription

### Conditional Filtering

```typescript
const stream$ = $();

// Only process even numbers
stream$.pipe(filter((num) => num % 2 === 0)).then((evenNum) => {
  console.log("Even number:", evenNum);
});

stream$.next(1); // No output
stream$.next(2); // Output: Even number: 2
stream$.next(3); // No output
stream$.next(4); // Output: Even number: 4
```

### Listen for Changes

```typescript
const stream$ = $({ user: { name: "John", age: 25 } });

// Only trigger when username changes
stream$
  .change((state) => state.user.name)
  .then((state) => {
    console.log("Username changed:", state.user.name);
  });

stream$.set((state) => {
  state.user.age = 26; // Age change, won't trigger
});

stream$.set((state) => {
  state.user.name = "Jane"; // Username change, will trigger
});
// Output: Username changed: Jane
```

## Step 5: Stream Combination

### Merge Latest Values from Multiple Streams

```typescript
import { $, combine } from "fluth";

const name$ = $("John");
const age$ = $(25);

// Merge latest values from two streams
const user$ = combine(name$, age$);

user$.then(([name, age]) => {
  console.log(`User: ${name}, Age: ${age}`);
});

name$.next("Jane");
age$.next(30);
// Output: User: Jane, Age: 30
```

### Wait for All Streams to Complete

```typescript
import { $, finish } from "fluth";

const task1$ = $();
const task2$ = $();
const task3$ = $();

// Wait for all tasks to complete
const allTasks$ = finish(task1$, task2$, task3$);

allTasks$.then(([result1, result2, result3]) => {
  console.log("All tasks completed:", { result1, result2, result3 });
});

// Complete each task
task1$.next("Task 1 completed", true); // true indicates stream end
task2$.next("Task 2 completed", true);
task3$.next("Task 3 completed", true);
// Output: All tasks completed: { result1: "Task 1 completed", result2: "Task 2 completed", result3: "Task 3 completed" }
```

## Step 6: Real-world Use Cases

### User Input Debouncing

```typescript
import { $, throttle } from "fluth";

const searchInput$ = $();

// Use throttle plugin, only process last input within 300ms
searchInput$.use(throttle(300)).then((keyword) => {
  console.log("Search:", keyword);
  // Execute search logic
});

// Simulate rapid user input
searchInput$.next("f");
searchInput$.next("fl");
searchInput$.next("flu");
searchInput$.next("fluth");
// Only outputs the last one: Search: fluth
```

### State Management

```typescript
import { $ } from "fluth";

// Application state
const appState$ = $({
  user: null,
  loading: false,
  error: null,
});

// Listen to user state changes
appState$
  .get((state) => state.user)
  .then((user) => {
    if (user) {
      console.log("User logged in:", user.name);
    } else {
      console.log("User not logged in");
    }
  });

// Listen to loading state
appState$
  .change((state) => state.loading)
  .then((state) => {
    console.log(state.loading ? "Loading..." : "Loading complete");
  });

// Simulate login process
appState$.set((state) => {
  state.loading = true;
});

setTimeout(() => {
  appState$.set((state) => {
    state.loading = false;
    state.user = { name: "John", id: 1 };
  });
}, 1000);
```

## Common Questions

### When to use next vs set?

- `next(value)`: Directly push new values, suitable for simple data types
- `set(setter)`: Immutable updates, suitable for complex objects, automatically handles deep copying

### How to unsubscribe?

```typescript
const stream$ = $();
const observable$ = stream$.then((data) => console.log(data));

// Unsubscribe
observable$.unsubscribe();
```

### How to handle errors?

```typescript
const stream$ = $();

stream$.then(
  (data) => console.log("Success:", data),
  (error) => console.log("Error:", error)
);

stream$.next("Normal data");
stream$.next(Promise.reject("Error message"));
```
