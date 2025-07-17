```typescript
type OnFulfilled<T> = Parameters<Promise<T>['then']>[0]
type OnRejected<T> = Parameters<Promise<T>['catch']>[0]
type OnFinally<T> = Parameters<Promise<T>['finally']>[0]

type Subjection = Pick<
  Observer,
  'then' | 'thenOnce' | 'catch' | 'finally' | 'unsubscribe' | 'setUnsubscribeCallback' | 'execute'
> & { finish: PromiseWithResolvers<any>['promise'] }

/**
 * then plugin, this plugin can be used to unsubscribe the current observer
 * @param unsubscribe
 */

type thenPlugin = (unsubscribe: () => void) => void
/** execute plugin, this plugin can be used to reset the current observer promise or unsubscribe the current observer
 * @param params plugin parameters
 * @returns return promise will reset observer promise
 */
type executePlugin = <T>(params: {
  result: Promise<T> | T
  set: (setter: (state: T) => Promise<void> | void) => Promise<T> | T
  root: boolean
  onfulfilled?: OnFulfilled
  onrejected?: OnRejected
  unsubscribe: () => void
}) => Promise<any> | any
```
