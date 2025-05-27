# consoleExec

- 详情

  [execute](/cn/guide/plugin.html#execute-插件)插件， 当推流到订阅节点后，会打印出节点订阅后的数据。

- 示例

  ```typescript
  import { $, consoleExec } from "fluth";

  const promise$ = $().use(consoleExec());

  promise$.then((value) => value + 1).then((value) => value + 1);

  promise$.next(1);
  // 打印：
  // value 1
  // value 2
  // value 3
  ```
