# Advanced Usage

## Unified Unsubscription

Taking the `vue` framework as an example, if a stream is imported from elsewhere into a `vue` component and you want subscriptions to automatically cancel when the component is destroyed, you can use the `thenPlugin` of [plugin](/en/api/stream#plugin) for unified handling:

```javascript
import { getCurrentScope, onScopeDispose } from "vue";
import { Stream } from "fluth";

const promise$ = new Stream();

promise$.plugin.then.push((unsubscribe) => {
  if (getCurrentScope()) onScopeDispose(unsubscribe);
});
```

Subscription nodes created in the `setup` function of `vue` single-file components will automatically unsubscribe when the `vue` component is destroyed, avoiding memory leaks.

## Unified Error Handling

Use the `executePlugin` of `plugin` to handle errors at nodes uniformly:

```javascript
import { Stream } from "fluth";

const promise$ = new Stream();

promise$.plugin.execute.push((promise) =>
  promise.catch((err) => {
    console.error(err);
  })
);
```

## Stream Branching

Stream branching refers to triggering the execution of another stream node within one stream

### Trigger Stream

![image](/branching-stream.drawio.png)

Triggering a [Stream](/en/api/stream#stream) node can push data

```typescript
import { Stream } from "fluth";

const promise1$ = new Stream();
const subjection1$ = promise1$.then((data) => console.log(data));

const promise2$ = new Stream();
// Trigger another stream within one stream
const subjection2$ = promise2$.then((data) => {
  promise1$.next(data + 1);
});
```

### Trigger Subjection

![image](/branching-subjection.drawio.png)

Triggering a [Subjection](/en/api/stream#subjection) node cannot push data

```typescript
import { Stream } from "fluth";

const promise1$ = new Stream();
const subjection1$ = promise1$.then((data) => console.log(data));

const promise2$ = new Stream();
// Trigger another stream within one stream
const subjection2$ = promise2$.then((data) => {
  subjection1$.execute();
});
```

## Stream Merging

If you need to merge data from multiple streams, you can use operators like [combine](/en/api/operator/combine), [merge](/en/api/operator/merge), [concat](/en/api/operator/concat), etc. for stream merging.
