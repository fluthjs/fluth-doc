<script setup>
import Stream from '../../components/stream.vue'
</script>

# Stream

Stream inherits [Observable](/en/api/observable). In addition to the properties and methods of Observable, the following methods are newly added:

<Stream />

## next

- Type

  ```typescript
  next(payload: any, finishFlag?: boolean): void;
  ```

- Details

  - Actively emit data in the current stream, `payload` is the data. When it is `Promise.reject(xxx)`, the subsequent `then` behaves the same as `promise`'s `then`;
  - The second parameter indicates whether the current stream is finished. When set to `true`, subsequent `set` and `next` will no longer execute, and after each node in the stream is executed, the node's `afterComplete` callback will be triggered, then the node's `unsubscribe` method will be called automatically.

- Example
  ```typescript
  import { $ } from 'fluth'
  const promise$ = $('1')
  promise$.then((value) => {
    console.log(value)
  })
  promise$.next('2') // Output 2
  ```

## set

- Type
  ```typescript
    set(setter: (value: T) => void, finishFlag?: boolean): void;
  ```
- Details

  Actively emit data in the current stream. The difference from `next` is that `set` receives a `setter` (can be sync or async) and emits a new immutable data; the second parameter indicates whether the current stream is finished. When set to `true`, subsequent `set` and `next` will no longer execute.

- Example

  ```typescript
  import { $ } from 'fluth'
  const promise$ = $({ a: 1, b: { c: 2 } })
  const oldValue = promise$.value
  promise$.then((value) => {
    console.log(value)
  })
  promise$.set((value) => {
    value.a = 2
  })

  const newValue = promise$.value
  console.log(oldValue === newValue) // false
  console.log(oldValue.b === newValue.b) // true
  ```

## complete

- Type

  ```typescript
  complete: () => void
  ```

- Details

  After calling the `complete` method, the stream will end. Subsequent `next` and `set` will no longer execute, and all nodes' `afterComplete` callbacks will be triggered, then the node's `unsubscribe` method will be called automatically.

- Example

  ```typescript
  import { $, console } from 'fluth'
  const promise$ = $()
  promise$.afterComplete(() => {
    console.log('complete')
  })
  promise$.complete() // Output complete
  ```

## pause

- Type

  ```typescript
  pause: () => void
  ```

- Details

  Pause the current stream. After executing the `pause` method, all subscribed nodes will not execute.

- Example

  ```typescript
  import { $, console } from 'fluth'

  const promise$ = $('1')
  promise$.then((value) => {
    console.log(value)
  })

  promise$.next('2') // Output 2
  promise$.pause()
  promise$.next('3') // No output 3
  ```

## restart

- Type

  ```typescript
  restart: () => void
  ```

- Details

  Restart the current stream. After executing the `restart` method, all subscribed nodes will start receiving and executing the stream's emissions.

- Example

  ```typescript
  import { $, console } from 'fluth'

  const promise$ = $('1')
  promise$.then((value) => {
    console.log(value)
  })

  promise$.pause()
  promise$.next('2') // No output 2
  promise$.restart()
  promise$.next('3') // Output 3
  ```
