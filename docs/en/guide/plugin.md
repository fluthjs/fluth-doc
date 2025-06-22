# Using Plugins

## Plugin Types

`fluth` supports three types of plugins: `then`, `execute`, `chain`

### then Plugin

Triggered during the `then` operation, generally used to unsubscribe nodes

```typescript
import { $ } from "fluth";

// Custom then plugin, unsubscribe node after 1 second
const thenPlugin = {
  then: (unsubscribe) => {
    setTimeout(unsubscribe, 1000);
  },
};

const promise$ = $(1).use(thenPlugin);

promise$.then((data) => {
  console.log(data);
});

promise$.next(2); // prints 2
sleep(1000);
promise$.next(3); // does not print 3
```

### execute Plugin

Modify the processing result when executing the subscription node

```typescript
import { $ } from "fluth";

// Custom execute plugin, modify result when executing node
const executePlugin = {
  execute: ({ result }) => {
    return result + 1;
  },
};

const promise$ = $().use(executePlugin);

promise$.then((data) => console.log(data));

promise$.next(1); // prints 2
```

### chain Plugin

Add chain methods to all subscription nodes on the stream

```typescript
import { Observable, $ } from "fluth";

// Custom chain plugin, add chain methods to the stream
const chainPlugin = {
  chain: (observer: Observable) => ({
    // Add custom chain method, can be called in chain
    customMethod: () => "current: " + observer.value,
  }),
};

const promise$ = $(1).use(chainPlugin);
const observable$ = promise$.then((data) => data + 1);
promise$.next(2);

console.log(promise$.customMethod()); // prints current 2
console.log(observable$.customMethod()); // prints current 3
```

## Creating Streams with Default Plugins

Before using plugins, streams need to add plugins using the `use` method. To avoid adding plugins every time, `fluth` provides a method `createStream` to create streams with default plugins.

```typescript
import { createStream, delay, throttle, debounce } from "fluth";

// Create streams with default plugins
const new$ = createStream(delay, throttle, debounce);
// Use stream
const promise$ = new$(1);
```
