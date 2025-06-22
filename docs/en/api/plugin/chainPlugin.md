# chainPlugin

- Details

  adds chain methods to all subscription nodes on the stream, extending Observable functionality.

- Type

  ```typescript
  type ChainPluginFn<T extends Observable = Observable> = (observer: T) => Record<string, any>;

  interface ChainPlugin {
    chain: ChainPluginFn;
  }
  ```

- Example

  Basic usage:

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

  Complex chain methods example:

  ```typescript
  import { Observable, $ } from "fluth";

  // Create a chain plugin that provides data transformation methods
  const transformPlugin = {
    chain: (observer: Observable) => ({
      // Add data mapping method
      map: (fn: (value: any) => any) => {
        return observer.then(fn);
      },
      // Add data filtering method
      filterValue: (condition: (value: any) => boolean) => {
        return observer.filter(condition);
      },
      // Add method to get current value
      getCurrentValue: () => observer.value,
    }),
  };

  const promise$ = $(10).use(transformPlugin);

  promise$
    .map((x) => x * 2)
    .filterValue((x) => x > 15)
    .then((value) => console.log("Result:", value));

  promise$.next(8); // Output: Result: 16
  promise$.next(5); // No output (10 <= 15)
  ```
