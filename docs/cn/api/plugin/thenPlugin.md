# thenPlugin

- 详情

在`then`操作时触发，一般用于取消订阅节点或执行统一的清理操作。

- 类型

  ```typescript
  type thenPlugin = (unsubscribe: () => void) => void;
  ```

- 示例

  ```typescript
  import { $ } from "fluth";

  // 自定义then插件, 1s后取消节点订阅
  const thenPlugin = {
    then: (unsubscribe) => {
      setTimeout(unsubscribe, 1000);
    },
  };

  const promise$ = $(1).use(thenPlugin);

  promise$.then((data) => {
    console.log(data);
  });

  promise$.next(2); // 打印2
  // 1秒后自动取消订阅
  promise$.next(3); // 不打印3
  ```

  统一取消订阅示例：

  ```typescript
  import { getCurrentScope, onScopeDispose } from "vue";
  import { $ } from "fluth";

  // Vue组件中的统一取消订阅插件
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
  // 组件销毁时自动取消订阅
  ```
