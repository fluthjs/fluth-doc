# 插件

- 类型

  ```typescript
  interface Plugin {
    then: thenPluginFn[];
    execute: executePlugin[];
    chain: ChainPluginFn[];
  }

  type thenPluginFn = (unsubscribe: () => void) => void;

  type executePlugin = <T>(params: {
    result: Promise<T> | T;
    set: (setter: (state: T) => Promise<void> | void) => Promise<T> | T;
    root: boolean;
    onfulfilled?: OnFulfilled;
    onrejected?: OnRejected;
    unsubscribe: () => void;
  }) => Promise<any> | any;

  type ChainPluginFn<T extends Observable = Observable> = (observer: T) => Record<string, any>;
  ```
