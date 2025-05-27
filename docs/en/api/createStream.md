# createStream

- Type

  ```typescript
  function createStream<P extends Plugin[]>(
    ...plugins: P
  ): {
    <T>(): Stream<T, false, ChainReturn<P, T, object>> & ChainReturn<P, T, object>;
    <T>(data: T): Stream<T, true, ChainReturn<P, T, object>> & ChainReturn<P, T, object>;
  };
  ```

  Where `Plugin` is a type detailed in [use](/en/api/stream.md#use)

- Details

`createStream` returns a `Stream` factory function. Streams created by this factory function will have the input plugins by default.

- Example

```typescript
import { createStream, delay, throttle, debounce } from "fluth";

// Create a stream factory function with default plugins
const new$ = createStream(delay, throttle, debounce);
// Use the plugin without use
const promise$ = new$(1).delay(1000);
```
