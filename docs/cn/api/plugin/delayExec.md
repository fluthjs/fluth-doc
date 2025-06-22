# delayExec

- 详情

  [execute](/cn/guide/plugin.html#execute-插件)插件， 当推流到订阅节点后会推迟指定时间后再将处理结果推给其子订阅节点。

- 类型

- 示例

  ```typescript
  import { $, delayExec } from "fluth";

  const promise$ = $().use(delayExec(100), consoleExec());

  promise$.then((value) => value + 1).then((value) => value + 1);

  promise$.next(1);

  // 打印：
  // sleep 100ms
  // value 1
  // sleep 100ms
  // value 2
  // sleep 100ms
  // value 3
  ```
