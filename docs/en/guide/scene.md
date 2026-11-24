# Use Cases

fluth is suitable for reactive programming scenarios. Compared to reactive data, organizing code with streams offers the following advantages:

- Easier to build reactive logic, reducing business complexity
- More declarative programming paradigm, greatly reducing code volume
- Easier to read code, with clear upstream and downstream relationships

![image](/structure.drawio.svg)

## Building Reactive Logic

For Vue or React developers, using reactive data to trigger view updates brings huge improvements in development efficiency, but reactive data in the logic layer hasn't realized its full potential.

In business logic, reactive data is typically used with watch to listen for data changes (or useEffect to listen for data changes), then trigger logic updates based on data changes. However, this approach has the following problems:

- Poor semantics
- Unclear data flow
- Timing issues are difficult to manage

So its use cases are quite limited, but using fluth's stream programming paradigm allows you to build the entire logic reactively, thus achieving improved development efficiency!

## Recommended Scenarios

Because fluth uses `_rootPromise`-based overwrite race semantics by default (similar to `switchMap`, silently discarding older in-flight async callbacks when a new value arrives), it is ideal for frontend workflows where only the latest result matters:

- **Query scenarios**: Debounced search input requests, filter/pagination changes, and tab-switched data fetching.
- **Rendering scenarios**: Async derived state computation and combining multiple sources to drive UI updates.
- **Interactive orchestration**: Form field linkage, cascading dropdown queries, and async validation that only cares about the latest input.

## Unsuitable Scenarios

::: warning Note
In scenarios where **messages must not be dropped**, do not rely on fluth's default async chain propagation. See [Boundary - Race Conditions with Async](/en/guide/boundary#race-conditions-with-async) for details.
:::

- **Continuous WebSocket / SSE message streams**: When consecutive messages enter an async `then` chain, newer messages silently discard unfinished callbacks from earlier messages.
- **Queued write operations & ordered commits**: Workflows requiring every write request to execute sequentially without losing downstream callbacks.
- **High-frequency analytics & log reporting**: Returning the reporting Promise directly in a stream node causes later events to overwrite and discard unfinished reporting chains.

In these cases, consume messages synchronously without returning a Promise to the stream, offload to an explicit sequential queue, batch events with [`buffer`](/en/api/operator/buffer), or use a dedicated queue / RxJS.
