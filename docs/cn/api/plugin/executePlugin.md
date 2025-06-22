# execute 插件

- 详情

在订阅节点执行时修改处理结果

- 类型

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
