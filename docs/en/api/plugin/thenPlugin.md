# thenPlugin

- Details

triggered during `then` operations, generally used for unsubscribing nodes or performing unified cleanup operations.

- Type

  ```typescript
  type thenPlugin = (unsubscribe: () => void) => void;
  ```

- Example

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
  // Automatically unsubscribe after 1 second
  promise$.next(3); // does not print 3
  ```

  Unified unsubscription example:

  ```typescript
  import { getCurrentScope, onScopeDispose } from "vue";
  import { $ } from "fluth";

  // Unified unsubscription plugin in Vue component
  const vueUnsubscribePlugin = {
    then: (unsubscribe) => {
      if (getCurrentScope()) {
        onScopeDispose(unsubscribe);
      }
    },
  };

  const promise$ = $(1).use(vueUnsubscribePlugin);

  promise$.then((data) => {
    console.log(data);
  });
  // Automatically unsubscribe when component is destroyed
  ```
