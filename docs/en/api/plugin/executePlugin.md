# executePlugin

- Details

  modifies the processing result when executing subscription nodes

- Type

  ```typescript
  export type executePlugin = <T>(params: {
    result: Promise<T> | T;
    set: (setter: (state: T) => Promise<void> | void) => Promise<T> | T;
    root: boolean;
    onfulfilled?: OnFulfilled;
    onrejected?: OnRejected;
    unsubscribe: () => void;
  }) => Promise<any> | any;
  ```
