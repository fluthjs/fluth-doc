# Using Plugins

## Plugin Types

`fluth` supports four types of plugins: `then`, `execute`, `thenAll`, `executeAll`

### then Plugin

Triggered when creating subscription nodes, receives unsubscribe function and current observer instance as parameters

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

### thenAll Plugin

Triggered when creating subscriptions for the root stream and all its child nodes, can only be used on root streams, using on child nodes will throw an error

```typescript
import { $ } from "fluth";

// Custom thenAll plugin, add unified processing for all then operations of root stream and child nodes
const thenAllPlugin = {
  thenAll: (unsubscribe) => {
    console.log("thenAll plugin triggered");
    // Can add unified logic here, such as unified unsubscription handling
  },
};

const promise$ = $(1).use(thenAllPlugin);

// First then node
promise$.then((data) => {
  console.log("First then:", data);
  return data + 1;
});

// Second then node (child node)
promise$.then((data) => {
  console.log("Second then:", data);
  return data * 2;
});

// Third then node (child node)
promise$.then((data) => {
  console.log("Third then:", data);
});

promise$.next(2);
// Output:
// thenAll plugin triggered
// First then: 2
// thenAll plugin triggered
// Second then: 3
// thenAll plugin triggered
// Third then: 6
```

### execute Plugin

Triggered when nodes execute, can modify execution results. The plugin receives an object containing `result`, `set`, `root`, `onfulfilled`, `onrejected`, `unsubscribe` and other parameters

```typescript
import { $ } from "fluth";

// Custom execute plugin, modify result when executing node
const executePlugin = {
  execute: ({ result, root, onfulfilled, onrejected }) => {
    console.log(`Executing node - Is root: ${root}, Result: ${result}`);
    return result + 1;
  },
};

const promise$ = $().use(executePlugin);

promise$.then((data) => console.log(data));

promise$.next(1); // Output: Executing node - Is root: true, Result: 1
// Output: 2
```

### executeAll Plugin

Triggered when executing the root stream and all its child nodes, can only be used on root streams, using on child nodes will throw an error. Plugins execute in left-to-right order, with the result of the previous plugin serving as input to the next plugin

```typescript
import { $ } from "fluth";

// Custom executeAll plugin, add unified processing for all execute operations of root stream and child nodes
const executeAllPlugin = {
  executeAll: ({ result, root, onfulfilled, onrejected }) => {
    // Skip pass-through nodes (nodes without processing functions)
    if (!root && !onfulfilled && !onrejected) {
      return result;
    }
    console.log("executeAll plugin triggered, result:", result, "is root:", root);
    return result;
  },
};

const promise$ = $().use(executeAllPlugin);

promise$.then((data) => data + 1).then((data) => data * 2);

promise$.next(1);
// Output:
// executeAll plugin triggered, result: 1 is root: true
// executeAll plugin triggered, result: 2 is root: false
// executeAll plugin triggered, result: 4 is root: false
```

## Plugin Usage Restrictions

- `thenAll` and `executeAll` plugins can only be used on root streams, using them on child nodes will throw an error
- `then` and `execute` plugins can be used on any node
- Plugins can be added using the `use` method and removed using the `remove` method

## Creating Streams with Default Plugins

Before using plugins, streams need to add plugins using the `use` method. To avoid adding plugins every time, `fluth` provides a method `createStream` to create streams with default plugins.

```typescript
import { createStream, delay, throttle, debounce } from "fluth";

// Create streams with default plugins
const new$ = createStream(delay, throttle, debounce);
// Use stream
const promise$ = new$(1);
```
