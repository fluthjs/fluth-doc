# delay

- 详情

  [chain](/cn/guide/plugin.html#chain-插件)插件，调用后会将流推迟指定时间后再推给其子订阅节点。

- 类型

  ```typescript
  delay: (delayTime: number) => Observable;
  ```

- 示例

  ```typescript
  import { $, delay } from "fluth";

  const promise$ = $().use(delay);

  promise$
    .then((value) => console.log(value))
    .delay(1000)
    .then((value) => console.log(value));
  promise$.next(1);
  // 打印 value 1
  // sleep 1000ms
  // 打印 value 1
  ```
