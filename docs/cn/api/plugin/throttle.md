# throttle

- 详情

  [chain](/cn/guide/plugin.html#chain-插件)插件， 当推流到订阅节点后会进行节流后再推向其子订阅节点。

- 类型

  ```typescript
  throttle: (throttleTime: number) => Observable;
  ```

- 示例
  ```typescript
  import { $, throttle } from "fluth";
  const promise$ = $().use(throttle(100), consoleExec());
  promise$.next(1);
  promise$.next(2);
  promise$.next(3);
  ```
