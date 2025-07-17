# Advanced Usage

## Unified Unsubscription

Take the `vue` framework as an example. If a stream is imported into a `vue` component from elsewhere and you want the subscription to be automatically unsubscribed when the component is destroyed, you can use the `thenPlugin` of [plugin](/en/api/stream#plugin) for unified handling:

```javascript
import { getCurrentScope, onScopeDispose } from 'vue'
import { Stream } from 'fluth'

const promise$ = new Stream()

promise$.plugin.then.push((unsubscribe) => {
  if (getCurrentScope()) onScopeDispose(unsubscribe)
})
```

In the `setup` function of a `vue` SFC, the subscription node will be automatically unsubscribed when the component is destroyed, avoiding memory leaks.

## Unified Error Handling

Use the `executePlugin` of `plugin` to handle errors at all nodes:

```javascript
import { Stream } from 'fluth'

const promise$ = new Stream()

promise$.plugin.execute.push((promise) =>
  promise.catch((err) => {
    console.error(err)
  })
)
```

## Branching

Branching refers to triggering the execution of another stream node within a stream.

### Triggering a Stream

![image](/branching-stream.drawio.png)

Triggering a [Stream](/en/api/stream#stream) node allows you to push data.

```typescript
import { Stream } from 'fluth'

const promise1$ = new Stream()
const subjection1$ = promise1$.then((data) => console.log(data))

const promise2$ = new Stream()
// Trigger another stream within a stream
const subjection2$ = promise2$.then((data) => {
  promise1$.next(data + 1)
})
```

### Triggering a Subjection

![image](/branching-subjection.drawio.png)
Triggering a [Subjection](/en/api/stream#subjection) node cannot push data.

```typescript
import { Stream } from 'fluth'

const promise1$ = new Stream()
const subjection1$ = promise1$.then((data) => console.log(data))

const promise2$ = new Stream()
// Trigger another stream within a stream
const subjection2$ = promise2$.then((data) => {
  subjection1$.execute()
})
```

## Merging Streams

If you need to merge data from multiple streams, check out operators like [combine](/en/api/operator/combine), [merge](/en/api/operator/merge), and [concat](/en/api/operator/concat) for merging.
