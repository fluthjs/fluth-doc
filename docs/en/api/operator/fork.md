# fork

Creates a new stream that forks from an input [Stream](/en/api/stream#stream) or [Observable](/en/api/observable). The new stream subscribes to the input stream and emits the same values.

- Type

  ```typescript
  type fork: <T>(arg$: Stream<T> | Observable<T>, autoUnsubscribe?: boolean) => Stream<T>;
  ```

- Parameters

  - `arg$`: Input Stream or Observable instance
  - `autoUnsubscribe`: Optional parameter, defaults to `true`. Controls whether the forked stream automatically unsubscribes when the input stream unsubscribes
    - `true`: When the input stream unsubscribes, the forked stream also automatically unsubscribes
    - `false`: When the input stream unsubscribes, the forked stream does not automatically unsubscribe

- Details

  - Fork operation creates a new stream to subscribe to the input stream
  - The new stream emits exactly the same values as the input stream (including success and error values)
  - Uses `thenImmediate` to immediately subscribe to the input stream, ensuring no values are missed
  - When `autoUnsubscribe` is `true`, the new stream will also unsubscribe asynchronously after the input stream unsubscribes
  - When `autoUnsubscribe` is `true`, the new stream will also [finish](/en/guide/base#completion) after the input stream finishes

- Example

  ```typescript
  import { $, fork } from 'fluth'

  const source$ = $('initial value')
  const forked$ = fork(source$)

  forked$.then((value) => {
    console.log('Forked value:', value)
  })

  console.log(forked$.value) // Output: initial value

  source$.next('new value')
  // Output: Forked value: new value

  forked$.next('new forked value')
  // Output: Forked value: new forked value
  ```

- Auto-unsubscribe example

  ```typescript
  import { $, fork } from 'fluth'

  // Default autoUnsubscribe = true
  const source$ = $()
  const autoFork$ = fork(source$)

  autoFork$.afterUnsubscribe(() => console.log('auto fork unsubscribed'))

  source$.unsubscribe()
  // Output: auto fork unsubscribed (executed asynchronously)
  ```

- Manual unsubscribe control example

  ```typescript
  import { $, fork } from 'fluth'

  // Set autoUnsubscribe = false
  const source$ = $()
  const manualFork$ = fork(source$, false)

  manualFork$.afterUnsubscribe(() => console.log('manual fork unsubscribed'))

  source$.unsubscribe()
  // No output, forked stream won't automatically unsubscribe

  // Manual unsubscribe still works
  manualFork$.unsubscribe()
  // Output: manual fork unsubscribed
  ```

- Error handling example

  ```typescript
  import { $, fork } from 'fluth'

  const source$ = $()
  const forked$ = fork(source$)

  forked$.then(
    (value) => console.log('resolved:', value),
    (error) => console.log('rejected:', error)
  )

  source$.next('success')
  // Output: resolved: success

  source$.next(Promise.reject('error'))
  // Output: rejected: error
  ```

- Completion state propagation example

  ```typescript
  import { $, fork } from 'fluth'

  const source$ = $()
  const autoFork$ = fork(source$, true) // Will respond to completion state
  const manualFork$ = fork(source$, false) // Will not respond to completion state

  autoFork$.afterComplete(() => console.log('auto fork completed'))
  manualFork$.afterComplete(() => console.log('manual fork completed'))

  source$.next('final', true)
  // Output: auto fork completed
  // manual fork will not complete
  ```
